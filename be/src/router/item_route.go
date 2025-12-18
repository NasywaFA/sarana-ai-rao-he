package router

import (
	"app/src/controller"
	"app/src/service"

	"github.com/gofiber/fiber/v2"
)

func ItemRoutes(v1 fiber.Router, itemService service.ItemService, itemTransactionService service.ItemTransactionService) {
	itemController := controller.NewItemController(itemService)
	itemTransactionController := controller.NewItemTransactionController(itemTransactionService)

	items := v1.Group("/items")
	
	// per item transaction routes
	items.Post("/:item_id/transactions", itemTransactionController.CreateTransaction)
	items.Get("/:item_id/transactions", itemTransactionController.GetItemTransaction)
	
	// Transfer route
	items.Post("/transfer", itemTransactionController.TransferItem)
	
	// all transactions route
	items.Get("/transactions", itemTransactionController.GetTransactions)

	// Item routes
	items.Get("/", itemController.GetAll)
	items.Post("/", itemController.Create)
	items.Put("/:id", itemController.Update)
	items.Delete("/:id", itemController.Delete)
	items.Get("/:id", itemController.GetByID)
}