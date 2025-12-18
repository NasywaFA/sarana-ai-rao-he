package controller

import (
	"app/src/service"
	"app/src/validation"
	
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type RecipeController struct {
	RecipeService service.RecipeService
}

func NewRecipeController(recipeService service.RecipeService) *RecipeController {
	return &RecipeController{
		RecipeService: recipeService,
	}
}

func (r *RecipeController) Create(c *fiber.Ctx) error {
	var req validation.CreateRecipe
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	recipe, err := r.RecipeService.CreateRecipe(c, &req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Recipe created successfully",
		"data":    recipe,
	})
}

func (r *RecipeController) GetAll(c *fiber.Ctx) error {
	params := new(validation.QueryRecipe)
	// Parse query
	if err := c.QueryParser(params); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid query parameters")
	}

	// Validate
	validate := validator.New()
	if err := validate.Struct(params); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

    // Call service
    recipes, total, err := r.RecipeService.GetRecipes(c, params)
    if err != nil {
        return err
    }

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Recipes retrieved successfully",
		"data":    recipes,
		"total":   total,
	})
}

func (r *RecipeController) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")

	recipe, err := r.RecipeService.GetRecipeByID(c, id)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Recipe retrieved successfully",
		"data":    recipe,
	})
}

func (r *RecipeController) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	var req validation.UpdateRecipe
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	recipe, err := r.RecipeService.UpdateRecipe(c, id, &req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Recipe updated successfully",
		"data":    recipe,
	})
}

func (r *RecipeController) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := r.RecipeService.DeleteRecipe(c, id); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Recipe deleted successfully",
	})
}

func (r *RecipeController) Cook(c *fiber.Ctx) error {
	id := c.Params("id")

	var req validation.CookRecipe
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	result, err := r.RecipeService.CookRecipe(c, id, &req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Recipe cooked successfully",
		"data":    result,
	})
}