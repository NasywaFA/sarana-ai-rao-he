package service

import (
	"errors"
	"fmt"
	"io"
	"strconv"
	"time"

	"app/src/model"
	"app/src/validation"
	"encoding/csv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"app/src/utils"
)

type ItemService interface {
	GetItems(c *fiber.Ctx, params *validation.QueryItem) ([]model.Item, int64, error)
	GetItemByID(c *fiber.Ctx, id string) (*model.Item, error)
	GetItemsByBranch(c *fiber.Ctx, branchID string) ([]model.Item, error)
	CreateItem(c *fiber.Ctx, req *validation.CreateItem) (*model.Item, error)
	UpdateItem(c *fiber.Ctx, req *validation.UpdateItem, id string) (*model.Item, error)
	DeleteItem(c *fiber.Ctx, id string) error
	ImportCSV(c *fiber.Ctx, branchID string, file io.Reader) error

	CreateTransaction(c *fiber.Ctx, req *validation.CreateItemTransaction) (*model.ItemTransaction, error)
	GetTransactions(c *fiber.Ctx, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error)
	GetItemTransactions(c *fiber.Ctx, itemID uint, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error)
}

type itemService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewItemService(db *gorm.DB, validate *validator.Validate) ItemService {
	return &itemService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (s *itemService) GetItems(c *fiber.Ctx, params *validation.QueryItem) ([]model.Item, int64, error) {
	var items []model.Item
	var total int64

	if err := s.Validate.Struct(params); err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.Limit

	query := s.DB.WithContext(c.Context()).Order("created_at asc")

	if params.BranchID != "" {
		query = query.Where("branch_id = ?", params.BranchID)
	}

	if search := params.Search; search != "" {
		query = query.Where("name LIKE ? OR code LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Model(&model.Item{}).Count(&total)

	result := query.Limit(params.Limit).Offset(offset).Find(&items)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return items, total, nil
}

func (s *itemService) GetItemByID(c *fiber.Ctx, id string) (*model.Item, error) {
	var item model.Item
	result := s.DB.WithContext(c.Context()).First(&item, "id = ?", id)
	if result.Error != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Item not found")
	}

	return &item, nil
}

func (s *itemService) GetItemsByBranch(c *fiber.Ctx, branchID string) ([]model.Item, error) {
	var items []model.Item

	if err := s.DB.
		WithContext(c.Context()).
		Where("branch_id = ?", branchID).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch items: %w", err)
	}

	return items, nil
}

func (s *itemService) CreateItem(c *fiber.Ctx, req *validation.CreateItem) (*model.Item, error) {
	if err := s.Validate.Struct(req); err != nil {
		return nil, err
	}

	item := &model.Item{
		BranchID: req.BranchID,
		Code:     req.Code,
		Name:     req.Name,
		Type:     req.Type,
		Stock:    float64(req.Stock),
		Unit:     req.Unit,
		LeadTime: req.LeadTime,
	}

	result := s.DB.WithContext(c.Context()).Create(item)
	if result.Error != nil {
		return nil, result.Error
	}

	return item, nil
}

func (s *itemService) UpdateItem(c *fiber.Ctx, req *validation.UpdateItem, id string) (*model.Item, error) {
	if err := s.Validate.Struct(req); err != nil {
		return nil, err
	}

	var item model.Item
	result := s.DB.WithContext(c.Context()).First(&item, "id = ?", id)
	if result.Error != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Item not found")
	}

	if req.Name != nil {
		item.Name = *req.Name
	}
	if req.Code != nil {
		item.Code = *req.Code
	}
	if req.Type != nil {
		item.Type = *req.Type
	}
	if req.Unit != nil {
		item.Unit = *req.Unit
	}
	if req.Stock != nil {
		item.Stock = float64(*req.Stock)
	}
	if req.LeadTime != nil {
		item.LeadTime = *req.LeadTime
	}

	item.UpdatedAt = time.Now()

	if err := s.DB.Save(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (s *itemService) DeleteItem(c *fiber.Ctx, id string) error {
	result := s.DB.WithContext(c.Context()).Delete(&model.Item{}, "id = ?", id)
	if result.RowsAffected == 0 {
		return fiber.NewError(fiber.StatusNotFound, "Item not found")
	}
	return result.Error
}

func (s *itemService) ImportCSV(c *fiber.Ctx, branchID string, file io.Reader) error {
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV: %v", err)
	}

	if len(records) < 2 {
		return fmt.Errorf("CSV is empty")
	}

	for i := 1; i < len(records); i++ {
		row := records[i]

		if len(row) < 6 {
			return fmt.Errorf("invalid CSV format at row %d", i+1)
		}

		stock, err := strconv.ParseFloat(row[3], 64)
		if err != nil {
			return fmt.Errorf("failed to parse stock at row %d", i+1)
		}

		leadTime, err := strconv.Atoi(row[5])
		if err != nil {
			return fmt.Errorf("failed to parse lead_time at row %d", i+1)
		}

		item := model.Item{
			BranchID: branchID,
			Code:     row[0],
			Name:     row[1],
			Type:     row[2],
			Stock:    stock,
			Unit:     row[4],
			LeadTime: leadTime,
		}

		if err := s.DB.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to insert row %d: %v", i+1, err)
		}
	}

	return nil
}

func (s *itemService) CreateTransaction(c *fiber.Ctx, req *validation.CreateItemTransaction) (*model.ItemTransaction, error) {
	var transaction *model.ItemTransaction

	err := s.DB.WithContext(c.Context()).Transaction(func(tx *gorm.DB) error {
		var item model.Item
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND branch_id = ?", req.ItemID, req.BranchID).
			First(&item).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("item not found for this branch")
			}
			return fmt.Errorf("failed to fetch item: %w", err)
		}

		var newStock float64
		if req.Type == "in" {
			newStock = item.Stock + req.Amount
		} else if req.Type == "out" {
			if item.Stock < req.Amount {
				return fmt.Errorf("insufficient stock: current stock is %.2f, requested %.2f", item.Stock, req.Amount)
			}
			newStock = item.Stock - req.Amount
		} else {
			return fmt.Errorf("invalid transaction type: %s", req.Type)
		}

		if err := tx.Model(&item).Update("stock", newStock).Error; err != nil {
			return fmt.Errorf("failed to update item stock: %w", err)
		}

		transactionDate := req.TransactionDate
		if transactionDate.IsZero() {
			transactionDate = time.Now()
		}

		transaction = &model.ItemTransaction{
			ItemID:          req.ItemID,
			BranchID:        req.BranchID,
			Type:            req.Type,
			Amount:          req.Amount,
			CurrentStock:    newStock,
			Note:            req.Note,
			TransactionDate: transactionDate,
		}

		if err := tx.Create(transaction).Error; err != nil {
			return fmt.Errorf("failed to create transaction: %w", err)
		}

		if err := tx.Preload("Item").First(transaction, transaction.ID).Error; err != nil {
			return fmt.Errorf("failed to load transaction data: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return transaction, nil
}

func (s *itemService) GetTransactions(c *fiber.Ctx, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error) {
	var transactions []model.ItemTransaction
	var total int64

	query := s.DB.WithContext(c.Context()).Model(&model.ItemTransaction{})

	if params.ItemID > 0 {
		query = query.Where("item_id = ?", params.ItemID)
	}

	if params.BranchID != "" {
		query = query.Where("branch_id = ?", params.BranchID)
	}

	if params.Type != "" {
		query = query.Where("type = ?", params.Type)
	}

	if !params.FromDate.IsZero() {
		query = query.Where("transaction_date >= ?", params.FromDate)
	}

	if !params.ToDate.IsZero() {
		query = query.Where("transaction_date <= ?", params.ToDate)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count transactions: %w", err)
	}

	page := params.Page
	if page < 1 {
		page = 1
	}

	limit := params.Limit
	if limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	if err := query.
		Preload("Item").
		Offset(offset).
		Limit(limit).
		Order("transaction_date DESC, created_at DESC").
		Find(&transactions).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to fetch transactions: %w", err)
	}

	return transactions, total, nil
}

func (s *itemService) GetItemTransactions(c *fiber.Ctx, itemID uint, params *validation.QueryItemTransaction) ([]model.ItemTransaction, int64, error) {
	params.ItemID = itemID

	return s.GetTransactions(c, params)
}
