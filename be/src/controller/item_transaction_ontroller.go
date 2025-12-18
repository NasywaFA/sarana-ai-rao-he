package controller

import (
	"app/src/service"
	"app/src/validation"

	"github.com/gofiber/fiber/v2"
)

type ItemTransactionController struct {
	ItemTransactionService service.ItemTransactionService
}

func NewItemTransactionController(itemTransactionService service.ItemTransactionService) *ItemTransactionController {
	return &ItemTransactionController{
		ItemTransactionService: itemTransactionService,
	}
}

func (t *ItemTransactionController) CreateTransaction(ctx *fiber.Ctx) error {
	req := new(validation.CreateItemTransaction)

	if err := ctx.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	transaction, err := t.ItemTransactionService.CreateTransaction(ctx, req)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"code":    fiber.StatusCreated,
		"message": "Transaction created successfully",
		"data":    transaction,
	})
}

func (t *ItemTransactionController) GetTransactions(ctx *fiber.Ctx) error {
	params := new(validation.QueryItemTransaction)

	if err := ctx.QueryParser(params); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid query parameters")
	}

	transactions, total, err := t.ItemTransactionService.GetTransactions(ctx, params)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(fiber.Map{
		"status":  "success",
		"code":    fiber.StatusOK,
		"message": "Transactions retrieved successfully",
		"data": fiber.Map{
			"transactions": transactions,
			"total":        total,
			"page":         params.Page,
			"limit":        params.Limit,
		},
	})
}

func (t *ItemTransactionController) GetItemTransaction(ctx *fiber.Ctx) error {
	itemID := ctx.Params("item_id")
	if itemID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Item ID is required")
	}

	params := new(validation.QueryItemTransaction)
	if err := ctx.QueryParser(params); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid query parameters")
	}

	transactions, total, err := t.ItemTransactionService.GetItemTransactions(ctx, itemID, params)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(fiber.Map{
		"status":  "success",
		"code":    fiber.StatusOK,
		"message": "Item transactions retrieved successfully",
		"data": fiber.Map{
			"transactions": transactions,
			"total":        total,
			"page":         params.Page,
			"limit":        params.Limit,
		},
	})
}

func (t *ItemTransactionController) TransferItem(ctx *fiber.Ctx) error {
	req := new(validation.TransferItem)

	if err := ctx.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	if err := t.ItemTransactionService.TransferItem(ctx, req); err != nil {
		statusCode := fiber.StatusInternalServerError
		if e, ok := err.(*fiber.Error); ok {
			statusCode = e.Code
		}
		return fiber.NewError(statusCode, err.Error())
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"code":    fiber.StatusCreated,
		"message": "Item transferred successfully",
		"data":    nil,
	})
}