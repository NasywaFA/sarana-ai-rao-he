package service

import (
	"app/src/model"
	"app/src/validation"
	
	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	
	"app/src/utils"
)

type RecipeService interface {
    CreateRecipe(c *fiber.Ctx, req *validation.CreateRecipe) (*model.Recipe, error)
    GetRecipes(c *fiber.Ctx, branchID string) ([]model.Recipe, error)
    GetRecipeByID(c *fiber.Ctx, id string) (*model.Recipe, error)
    UpdateRecipe(c *fiber.Ctx, id string, req *validation.UpdateRecipe) (*model.Recipe, error)
    DeleteRecipe(c *fiber.Ctx, id string) error
}

type recipeService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewRecipeService(db *gorm.DB, validate *validator.Validate) RecipeService {
    return &recipeService{
        Log:      utils.Log,
        DB:       db,
        Validate: validate,
    }
}

func (s *recipeService) CreateRecipe(c *fiber.Ctx, req *validation.CreateRecipe) (*model.Recipe, error) {
    if err := s.Validate.Struct(req); err != nil {
        return nil, err
    }

    recipe := &model.Recipe{
        BranchID:    req.BranchID,
        Name:        req.Name,
        Description: req.Description,
        Ingredients: req.Ingredients,
        Instruction: req.Instruction,
        CreatedBy:   req.CreatedBy,
    }

    if err := s.DB.WithContext(c.Context()).Create(recipe).Error; err != nil {
        return nil, err
    }

    return recipe, nil
}

func (s *recipeService) GetRecipes(c *fiber.Ctx, branchID string) ([]model.Recipe, error) {
	var recipes []model.Recipe

	err := s.DB.WithContext(c.Context()).
		Where("branch_id = ?", branchID).
		Find(&recipes).Error

	return recipes, err
}

func (s *recipeService) GetRecipeByID(c *fiber.Ctx, id string) (*model.Recipe, error) {
	var recipe model.Recipe

	err := s.DB.WithContext(c.Context()).
		First(&recipe, "id = ?", id).Error

	if err != nil {
		return nil, err
	}

	return &recipe, nil
}

func (s *recipeService) UpdateRecipe(c *fiber.Ctx, id string, req *validation.UpdateRecipe) (*model.Recipe, error) {
    if err := s.Validate.Struct(req); err != nil {
        return nil, err
    }

    var recipe model.Recipe
    if err := s.DB.First(&recipe, "id = ?", id).Error; err != nil {
        return nil, err
    }

    if req.Name != nil {
        recipe.Name = *req.Name
    }
    if req.Description != nil {
        recipe.Description = *req.Description
    }
    if req.Ingredients != nil {
        recipe.Ingredients = *req.Ingredients
    }
    if req.Instruction != nil {
        recipe.Instruction = *req.Instruction
    }
    if req.BranchID != nil {
        recipe.BranchID = *req.BranchID
    }

    if err := s.DB.WithContext(c.Context()).Save(&recipe).Error; err != nil {
        return nil, err
    }

    return &recipe, nil
}

func (s *recipeService) DeleteRecipe(c *fiber.Ctx, id string) error {
    return s.DB.WithContext(c.Context()).
        Delete(&model.Recipe{}, "id = ?", id).Error
}
