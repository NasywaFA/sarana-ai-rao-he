package service

import (
	"app/src/model"
	"app/src/utils"
	"app/src/validation"
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ItemTransactionService interface {
	CreateTransaction(c *fiber.Ctx, req *validation.CreateItemTransaction) (*model.ItemTransaction, error)
	GetTransactions(c *fiber.Ctx, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error)
	GetItemTransactions(c *fiber.Ctx, itemID string, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error)
	TransferItem(c *fiber.Ctx, req *validation.TransferItem) error
}

type itemTransactionService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewItemTransactionService(db *gorm.DB, validate *validator.Validate) ItemTransactionService {
	return &itemTransactionService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (t *itemTransactionService) CreateTransaction(c *fiber.Ctx, req *validation.CreateItemTransaction) (*model.ItemTransaction, error) {
	var transaction *model.ItemTransaction

	err := t.DB.WithContext(c.Context()).Transaction(func(tx *gorm.DB) error {

		var item model.Item
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND branch_id = ?", req.ItemID, req.BranchID).
			First(&item).Error; err != nil {
			return err
		}

		var newStock float64
		if req.Type == "in" {
			newStock = item.Stock + req.Amount
		} else {
			if item.Stock < req.Amount {
				return errors.New("insufficient stock")
			}
			newStock = item.Stock - req.Amount
		}

		if err := tx.Model(&item).Update("stock", newStock).Error; err != nil {
			return err
		}

		transaction = &model.ItemTransaction{
			ItemID:       req.ItemID,
			BranchID:     req.BranchID,
			Type:         req.Type,
			Amount:       req.Amount,
			CurrentStock: newStock,
			Note:         req.Note,
		}

		if err := tx.Create(transaction).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return transaction, nil
}

func (t *itemTransactionService) GetTransactions(c *fiber.Ctx, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error) {
	var transactions []model.ItemTransaction
	var total int64

	query := t.DB.WithContext(c.Context()).Model(&model.ItemTransaction{})
	if params.BranchID != "" {
		query = query.Where("branch_id = ?", params.BranchID)
	}
	if params.Type != "" {
		query = query.Where("type = ?", params.Type)
	}
	if params.ItemID != nil {
		query = query.Where("item_id = ?", params.ItemID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (params.Page - 1) * params.Limit
	query = query.Offset(offset).Limit(params.Limit)

	query = query.Order("created_at DESC")

	query = query.Preload("Item").Preload("Branch")

	if err := query.Find(&transactions).Error; err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

func (t *itemTransactionService) GetItemTransactions(c *fiber.Ctx, itemID string, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error) {
	if _, err := uuid.Parse(itemID); err != nil {
		return nil, 0, errors.New("invalid item ID format")
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.Limit <= 0 {
		params.Limit = 10
	}

	var transactions []model.ItemTransaction
	var total int64

	query := t.DB.WithContext(c.Context()).
		Model(&model.ItemTransaction{}).
		Where("item_id = ?", itemID)

	if params.BranchID != "" {
		query = query.Where("branch_id = ?", params.BranchID)
	}
	if params.Type != "" {
		query = query.Where("type = ?", params.Type)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.Limit

	if err := query.
		Preload("Item").
		Preload("Branch").
		Order("created_at DESC").
		Offset(offset).
		Limit(params.Limit).
		Find(&transactions).Error; err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

func (t *itemTransactionService) TransferItem(c *fiber.Ctx, req *validation.TransferItem) error {
	itemID, err := uuid.Parse(req.ItemID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid item_id")
	}

	fromBranchID, err := uuid.Parse(req.FromBranchID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid from_branch_id")
	}

	toBranchID, err := uuid.Parse(req.ToBranchID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid to_branch_id")
	}

	if fromBranchID == toBranchID {
		return fiber.NewError(
			fiber.StatusBadRequest,
			"from_branch and to_branch must be different",
		)
	}

	return t.DB.WithContext(c.Context()).Transaction(func(tx *gorm.DB) error {

		var itemFrom model.Item
		if err := tx.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND branch_id = ?", itemID, fromBranchID).
			First(&itemFrom).Error; err != nil {

			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fiber.NewError(
					fiber.StatusNotFound,
					"Item not found in source branch",
				)
			}
			return err
		}

		if itemFrom.Stock < req.Amount {
			return fiber.NewError(
				fiber.StatusBadRequest,
				"Insufficient stock",
			)
		}

		newStockFrom := itemFrom.Stock - req.Amount
		
		if err := tx.Model(&itemFrom).
			Update("stock", newStockFrom).Error; err != nil {
			return err
		}

		var itemTo model.Item
		err := tx.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("code = ? AND branch_id = ?", itemFrom.Code, toBranchID).
			First(&itemTo).Error

		if errors.Is(err, gorm.ErrRecordNotFound) {
			itemTo = model.Item{
				ID:       uuid.New(),
				Code:     itemFrom.Code,
				Name:     itemFrom.Name,
				BranchID: toBranchID.String(),
				Stock:    0,
			}
			if err := tx.Create(&itemTo).Error; err != nil {
				return err
			}
		} else if err != nil {
			return err
		}

		newStockTo := itemTo.Stock + req.Amount

		if err := tx.Model(&itemTo).
			Update("stock", newStockTo).Error; err != nil {
			return err
		}

		transOut := &model.ItemTransaction{
            ItemID:          itemFrom.ID,
            BranchID:        fromBranchID.String(),
            Type:            "transfer_out",
            Amount:          req.Amount,
            CurrentStock:    newStockFrom,
            Note:            req.Note,
            TransactionDate: time.Now(),
        }

		if err := tx.Create(transOut).Error; err != nil {
            return err
        }
        transIn := &model.ItemTransaction{
            ItemID:          itemTo.ID,
            BranchID:        toBranchID.String(),
            Type:            "transfer_in",
            Amount:          req.Amount,
            CurrentStock:    newStockTo,
            Note:            req.Note,
            TransactionDate: time.Now(),
        }
        
        if err := tx.Create(transIn).Error; err != nil {
            return err
        }

		return nil
	})
}
