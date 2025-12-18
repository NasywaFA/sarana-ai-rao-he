package service

import (
	"fmt"
	"io"
	"strconv"
	"time"

	"app/src/model"
	"app/src/validation"
	"encoding/csv"
	"app/src/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ItemService interface {
	GetItems(c *fiber.Ctx, params *validation.QueryItem) ([]model.Item, int64, error)
	GetItemByID(c *fiber.Ctx, id string) (*model.Item, error)
	GetItemsByBranch(c *fiber.Ctx, branchID string) ([]model.Item, error)
	CreateItem(c *fiber.Ctx, req *validation.CreateItem) (*model.Item, error)
	UpdateItem(c *fiber.Ctx, req *validation.UpdateItem, id string) (*model.Item, error)
	DeleteItem(c *fiber.Ctx, id string) error
	ImportCSV(c *fiber.Ctx, branchID string, file io.Reader) error
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

func (i *itemService) GetItems(c *fiber.Ctx, params *validation.QueryItem) ([]model.Item, int64, error) {
	var items []model.Item
	var total int64

	if err := i.Validate.Struct(params); err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.Limit

	if params.BranchID == "" {
		return nil, 0, fiber.NewError(fiber.StatusBadRequest, "branch_id is required")
	}

	query := i.DB.WithContext(c.Context()).Where("branch_id = ?", params.BranchID).Order("created_at asc")

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

func (i *itemService) GetItemByID(c *fiber.Ctx, id string) (*model.Item, error) {
	var item model.Item
	result := i.DB.WithContext(c.Context()).First(&item, "id = ?", id)
	if result.Error != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Item not found")
	}

	return &item, nil
}

func (i *itemService) GetItemsByBranch(c *fiber.Ctx, branchID string) ([]model.Item, error) {
	var items []model.Item

	if err := i.DB.
		WithContext(c.Context()).
		Where("branch_id = ?", branchID).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch items: %w", err)
	}

	return items, nil
}

func (i *itemService) CreateItem(c *fiber.Ctx, req *validation.CreateItem) (*model.Item, error) {
	if err := i.Validate.Struct(req); err != nil {
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

	result := i.DB.WithContext(c.Context()).Create(item)
	if result.Error != nil {
		return nil, result.Error
	}

	return item, nil
}

func (i *itemService) UpdateItem(c *fiber.Ctx, req *validation.UpdateItem, id string) (*model.Item, error) {
	if err := i.Validate.Struct(req); err != nil {
		return nil, err
	}

	var item model.Item
	result := i.DB.WithContext(c.Context()).First(&item, "id = ?", id)
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

	if err := i.DB.Save(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (i *itemService) DeleteItem(c *fiber.Ctx, id string) error {
	result := i.DB.WithContext(c.Context()).Delete(&model.Item{}, "id = ?", id)
	if result.RowsAffected == 0 {
		return fiber.NewError(fiber.StatusNotFound, "Item not found")
	}
	return result.Error
}

func (i *itemService) ImportCSV(c *fiber.Ctx, branchID string, file io.Reader) error {
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV: %v", err)
	}

	if len(records) < 2 {
		return fmt.Errorf("CSV is empty")
	}

	for idx := 1; idx < len(records); idx++ {
		row := records[idx]

		if len(row) < 6 {
			return fmt.Errorf("invalid CSV format at row %d", idx+1)
		}

		stock, err := strconv.ParseFloat(row[3], 64)
		if err != nil {
			return fmt.Errorf("failed to parse stock at row %d", idx+1)
		}

		leadTime, err := strconv.Atoi(row[5])
		if err != nil {
			return fmt.Errorf("failed to parse lead_time at row %d", idx+1)
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

		if err := i.DB.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to insert row %d: %v", idx+1, err)
		}
	}

	return nil
}