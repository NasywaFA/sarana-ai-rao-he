package router

import (
	"app/src/controller"
	"app/src/service"
	
	"github.com/gofiber/fiber/v2"
)

func RecipeRoutes(v1 fiber.Router, recipeService service.RecipeService) {
	recipeController := controller.NewRecipeController(recipeService)

	recipes := v1.Group("/recipes")

	recipes.Post("/", recipeController.Create)
	recipes.Get("/", recipeController.GetAllByBranch)
	recipes.Get("/:id", recipeController.GetByID)
	recipes.Put("/:id", recipeController.Update)
	recipes.Delete("/:id", recipeController.Delete)
}