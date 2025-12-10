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
	items.Get("/:id", itemController.GetByID)
	items.Post("/", itemController.Create)
	items.Put("/:id", itemController.Update)
	items.Delete("/:id", itemController.Delete)
	
	items.Post("/import-csv", itemController.ImportCSV)
	
	items.Get("/:id/transactions", itemController.GetTransactions)
	
	transactions := v1.Group("/transactions")
	
	transactions.Get("/", itemController.GetAllTransactions)
	transactions.Post("/", itemController.CreateTransaction)
}