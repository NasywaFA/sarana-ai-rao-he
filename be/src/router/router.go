package router

import (
	"app/src/config"
	"app/src/service"
	"app/src/validation"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func Routes(app *fiber.App, db *gorm.DB) {
	validate := validation.Validator()

	healthCheckService := service.NewHealthCheckService(db)
	emailService := service.NewEmailService()
	userService := service.NewUserService(db, validate)
	tokenService := service.NewTokenService(db, validate, userService)
	authService := service.NewAuthService(db, validate, userService, tokenService)
	branchService := service.NewBranchService(db, validate)
	itemService := service.NewItemService(db, validate)
	recipeService := service.NewRecipeService(db, validate)

	v1 := app.Group("/v1")

	HealthCheckRoutes(v1, healthCheckService)
	AuthRoutes(v1, authService, userService, tokenService, emailService)
	UserRoutes(v1, userService, tokenService)
	BranchRoutes(v1, branchService)
	ItemRoutes(v1, itemService)
	RecipeRoutes(v1, recipeService)
	// TODO: add another routes here...

	if !config.IsProd {
		DocsRoutes(v1)
	}
}