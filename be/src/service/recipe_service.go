package service

import (
	"errors"
	"fmt"

	"app/src/model"
	"app/src/validation"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"app/src/utils"
)

type RecipeService interface {
	CreateRecipe(c *fiber.Ctx, req *validation.CreateRecipe) (*model.Recipe, error)
	GetRecipes(c *fiber.Ctx, params *validation.QueryRecipe) ([]model.Recipe, int64, error)
	GetRecipeByID(c *fiber.Ctx, id string) (*model.Recipe, error)
	UpdateRecipe(c *fiber.Ctx, id string, req *validation.UpdateRecipe) (*model.Recipe, error)
	DeleteRecipe(c *fiber.Ctx, id string) error
	CookRecipe(c *fiber.Ctx, id string, req *validation.CookRecipe) (interface{}, error)
}

type recipeService struct {
	Log                    *logrus.Logger
	DB                     *gorm.DB
	Validate               *validator.Validate
	ItemService            ItemService
	ItemTransactionService ItemTransactionService
}

func NewRecipeService(db *gorm.DB, validate *validator.Validate, itemService ItemService, itemTransactionService ItemTransactionService) RecipeService {
	return &recipeService{
		Log:                    utils.Log,
		DB:                     db,
		Validate:               validate,
		ItemService:            itemService,
		ItemTransactionService: itemTransactionService,
	}
}

func (r *recipeService) CreateRecipe(c *fiber.Ctx, req *validation.CreateRecipe) (*model.Recipe, error) {
	if err := r.Validate.Struct(req); err != nil {
		return nil, err
	}

	recipe := model.Recipe{
		BranchID:    req.BranchID,
		Code:        req.Code,
		Name:        req.Name,
		Type:        req.Type,
		Description: req.Description,
		Instruction: req.Instruction,
		CreatedBy:   req.CreatedBy,
	}

	err := r.DB.WithContext(c.Context()).Transaction(func(tx *gorm.DB) error {

		if err := tx.Create(&recipe).Error; err != nil {
			return err
		}

		for _, ing := range req.Ingredients {

			var item model.Item
			if err := tx.Where("id = ? AND branch_id = ?", ing.ItemID, req.BranchID).
				First(&item).Error; err != nil {
				return fmt.Errorf("item %s tidak ditemukan", ing.ItemID)
			}

			if item.Stock < ing.Quantity {
				return fmt.Errorf(
					"stok item '%s' kurang: tersedia %.2f, dibutuhkan %.2f",
					item.Name, item.Stock, ing.Quantity,
				)
			}

			newQty := item.Stock - ing.Quantity
			if err := tx.Model(&item).Update("stock", newQty).Error; err != nil {
				return err
			}

			ingredient := model.RecipeIngredient{
				RecipeID: recipe.ID.String(),
				ItemID:   ing.ItemID,
				BranchID: req.BranchID,
				Quantity: ing.Quantity,
				Unit:     ing.Unit,
			}

			if err := tx.Create(&ingredient).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	if err := r.DB.WithContext(c.Context()).
		Preload("Ingredients.Item").
		First(&recipe, "id = ?", recipe.ID).Error; err != nil {
		return nil, err
	}

	return &recipe, nil
}

func (r *recipeService) GetRecipes(c *fiber.Ctx, params *validation.QueryRecipe) ([]model.Recipe, int64, error) {
	if params.BranchID == "" {
		return nil, 0, fiber.NewError(fiber.StatusBadRequest, "branch_id is required")
	}

	var branch model.Branch
	if err := r.DB.First(&branch, "id = ?", params.BranchID).Error; err != nil {
		return nil, 0, fiber.NewError(fiber.StatusNotFound, "branch not found")
	}

	var recipes []model.Recipe
	var total int64

	q := r.DB.Where("branch_id = ?", params.BranchID)

	if err := q.Model(&model.Recipe{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.Limit
	if err := q.Limit(params.Limit).Offset(offset).Find(&recipes).Error; err != nil {
		return nil, 0, err
	}

	return recipes, total, nil
}

func (r *recipeService) GetRecipeByID(c *fiber.Ctx, id string) (*model.Recipe, error) {
	if _, err := uuid.Parse(id); err != nil {
		return nil, errors.New("invalid recipe ID")
	}

	var recipe model.Recipe
	if err := r.DB.WithContext(c.Context()).Preload("Ingredients.Item").First(&recipe, "id = ? AND deleted_at IS NULL", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("recipe not found")
		}
		return nil, err
	}

	return &recipe, nil
}

func (r *recipeService) UpdateRecipe(c *fiber.Ctx, id string, req *validation.UpdateRecipe) (*model.Recipe, error) {
	if err := r.Validate.Struct(req); err != nil {
		return nil, err
	}

	if _, err := uuid.Parse(id); err != nil {
		return nil, errors.New("invalid recipe ID")
	}

	var recipe model.Recipe
	if err := r.DB.WithContext(c.Context()).First(&recipe, "id = ? AND deleted_at IS NULL", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("recipe not found")
		}
		return nil, err
	}

	err := r.DB.WithContext(c.Context()).Transaction(func(tx *gorm.DB) error {
		updates := make(map[string]interface{})

		if req.Code != "" {
			updates["code"] = req.Code
		}
		if req.Name != "" {
			updates["name"] = req.Name
		}
		if req.Type != "" {
			updates["type"] = req.Type
		}
		updates["description"] = req.Description
		updates["instruction"] = req.Instruction

		if len(updates) > 0 {
			if err := tx.Model(&recipe).Updates(updates).Error; err != nil {
				return err
			}
		}

		if req.Ingredients != nil {
			if err := tx.Where("recipe_id = ?", id).Delete(&model.RecipeIngredient{}).Error; err != nil {
				return err
			}

			for _, ing := range req.Ingredients {
				ingredient := model.RecipeIngredient{
					RecipeID: id,
					ItemID:   ing.ItemID,
					BranchID: recipe.BranchID,
					Quantity: ing.Quantity,
					Unit:     ing.Unit,
				}
				if err := tx.Create(&ingredient).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	if err := r.DB.WithContext(c.Context()).Preload("Ingredients.Item").First(&recipe, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &recipe, nil
}

func (r *recipeService) DeleteRecipe(c *fiber.Ctx, id string) error {
	if _, err := uuid.Parse(id); err != nil {
		return errors.New("invalid recipe ID")
	}

	var recipe model.Recipe
	if err := r.DB.WithContext(c.Context()).First(&recipe, "id = ? AND deleted_at IS NULL", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("recipe not found")
		}
		return err
	}

	if err := r.DB.WithContext(c.Context()).Model(&recipe).Update("deleted_at", gorm.Expr("NOW()")).Error; err != nil {
		return err
	}

	return nil
}

type StockChange struct {
	ItemID      string  `json:"item_id"`
	ItemCode    string  `json:"item_code"`
	ItemName    string  `json:"item_name"`
	OldStock    float64 `json:"old_stock"`
	NewStock    float64 `json:"new_stock"`
	Consumed    float64 `json:"consumed"`
	Unit        string  `json:"unit"`
	Transaction string  `json:"transaction_id"`
}

type CookRecipeResponse struct {
	RecipeID     string        `json:"recipe_id"`
	RecipeName   string        `json:"recipe_name"`
	ServeCount   int           `json:"serve_count"`
	StockChanges []StockChange `json:"stock_changes"`
	Success      bool          `json:"success"`
	Message      string        `json:"message"`
}

func (r *recipeService) CookRecipe(c *fiber.Ctx, id string, req *validation.CookRecipe) (interface{}, error) {
	if err := r.Validate.Struct(req); err != nil {
		return nil, err
	}

	if _, err := uuid.Parse(id); err != nil {
		return nil, errors.New("invalid recipe ID")
	}

	var recipe model.Recipe
	if err := r.DB.WithContext(c.Context()).Preload("Ingredients.Item").First(&recipe, "id = ? AND deleted_at IS NULL", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("recipe not found")
		}
		return nil, err
	}

	if len(recipe.Ingredients) == 0 {
		return nil, errors.New("recipe has no ingredients")
	}

	var stockChanges []StockChange
	var insufficientItems []string

	err := r.DB.WithContext(c.Context()).Transaction(func(tx *gorm.DB) error {
		for _, ingredient := range recipe.Ingredients {
			requiredQuantity := ingredient.Quantity * float64(req.ServeCount)

			var item model.Item
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
				Where("id = ? AND branch_id = ?", ingredient.ItemID, ingredient.BranchID).
				First(&item).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return fmt.Errorf("item %s not found in branch", ingredient.ItemID)
				}
				return err
			}

			if item.Stock < requiredQuantity {
				insufficientItems = append(insufficientItems, fmt.Sprintf("%s (%s): need %.2f %s, available %.2f %s (short by %.2f)",
					item.Name, item.Code, requiredQuantity, item.Unit, item.Stock, item.Unit, requiredQuantity-item.Stock))
				continue
			}

			oldStock := item.Stock
			item.Stock -= requiredQuantity

			if err := tx.Save(&item).Error; err != nil {
				return err
			}

			transactionReq := &validation.CreateItemTransaction{
				ItemID:   item.ID,
				BranchID: item.BranchID,
				Type:     "out",
				Amount:   requiredQuantity,
				Note:     fmt.Sprintf("Recipe: %s (Cook %d servings)", recipe.Name, req.ServeCount),
			}

			transaction, err := r.ItemTransactionService.CreateTransaction(c, transactionReq)
			if err != nil {
				return err
			}

			stockChanges = append(stockChanges, StockChange{
				ItemID:      item.ID.String(),
				ItemCode:    item.Code,
				ItemName:    item.Name,
				OldStock:    oldStock,
				NewStock:    item.Stock,
				Consumed:    requiredQuantity,
				Unit:        item.Unit,
				Transaction: transaction.ID.String(),
			})
		}

		if len(insufficientItems) > 0 {
			return fmt.Errorf("insufficient stock for items: %v", insufficientItems)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	response := CookRecipeResponse{
		RecipeID:     recipe.ID.String(),
		RecipeName:   recipe.Name,
		ServeCount:   req.ServeCount,
		StockChanges: stockChanges,
		Success:      true,
		Message:      fmt.Sprintf("Successfully cooked %d servings of %s", req.ServeCount, recipe.Name),
	}

	return response, nil
}
