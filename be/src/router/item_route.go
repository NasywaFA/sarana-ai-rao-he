package router

import (
	"app/src/controller"
	"app/src/service"
	
	"github.com/gofiber/fiber/v2"
)

func ItemRoutes(v1 fiber.Router, itemService service.ItemService) {
	itemController := controller.NewItemController(itemService)

	items := v1.Group("/items")

	items.Get("/", itemController.GetAll)
	items.Post("/", itemController.Create)
	items.Post("/import-csv", itemController.ImportCSV)	
}