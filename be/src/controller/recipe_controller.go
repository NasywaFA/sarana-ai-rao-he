package controller

import (
	"app/src/service"
	"app/src/validation"

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

func (rc *RecipeController) Create(c *fiber.Ctx) error {
	var req validation.CreateRecipe

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	recipe, err := rc.RecipeService.CreateRecipe(c, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(recipe)
}

func (rc *RecipeController) GetAllByBranch(c *fiber.Ctx) error {
    branchID := c.Query("branch_id")
    if branchID == "" {
        return fiber.NewError(fiber.StatusBadRequest, "branch_id is required")
    }

    recipes, err := rc.RecipeService.GetRecipes(c, branchID)
    if err != nil {
        return err
    }

    return c.JSON(recipes)
}


func (rc *RecipeController) GetByID(c *fiber.Ctx) error {
    id := c.Params("id")
    if id == "" {
        return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
    }

    recipe, err := rc.RecipeService.GetRecipeByID(c, id)
    if err != nil {
        return err
    }

    return c.JSON(recipe)
}


func (rc *RecipeController) Update(c *fiber.Ctx) error {
    id := c.Params("id")
    if id == "" {
        return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
    }

    var req validation.UpdateRecipe
    if err := c.BodyParser(&req); err != nil {
        return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
    }

    updatedRecipe, err := rc.RecipeService.UpdateRecipe(c, id, &req)
    if err != nil {
        return err
    }

    return c.JSON(updatedRecipe)
}

func (rc *RecipeController) Delete(c *fiber.Ctx) error {
    id := c.Params("id")
    if id == "" {
        return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
    }

    if err := rc.RecipeService.DeleteRecipe(c, id); err != nil {
        return err
    }

    return c.JSON(fiber.Map{
        "message": "Recipe deleted successfully",
    })
}
