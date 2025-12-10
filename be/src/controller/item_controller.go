package controller

import (
	"strconv"
	"strings"
	"app/src/service"
	"app/src/validation"

	"github.com/gofiber/fiber/v2"
	"github.com/go-playground/validator/v10"
)

type ItemController struct {
	ItemService service.ItemService
}

func NewItemController(itemService service.ItemService) *ItemController {
	return &ItemController{
		ItemService: itemService,
	}
}

func (i *ItemController) Create(c *fiber.Ctx) error {
	req := new(validation.CreateItem)

	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	item, err := i.ItemService.CreateItem(c, req)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Item created successfully",
		"data":    item,
	})
}

func (i *ItemController) GetAll(c *fiber.Ctx) error {
	query := new(validation.QueryItem)

	if err := c.QueryParser(query); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid query params")
	}

	items, total, err := i.ItemService.GetItems(c, query)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"total": total,
		"data":  items,
	})
}

func (i *ItemController) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return fiber.NewError(fiber.StatusBadRequest, "ID is required")
	}

	item, err := i.ItemService.GetItemByID(c, id)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": item,
	})
}

func (i *ItemController) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return fiber.NewError(fiber.StatusBadRequest, "ID is required")
	}

	req := new(validation.UpdateItem)
	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	item, err := i.ItemService.UpdateItem(c, req, id)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Item updated successfully",
		"data":    item,
	})
}

func (i *ItemController) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return fiber.NewError(fiber.StatusBadRequest, "ID is required")
	}

	if err := i.ItemService.DeleteItem(c, id); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Item deleted successfully",
	})
}

func (ctr *ItemController) ImportCSV(c *fiber.Ctx) error {
	branchID := c.Query("branch_id")
	if branchID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "branch_id is required")
	}

	file, err := c.FormFile("file")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "CSV file is required")
	}

	f, err := file.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to open file")
	}
	defer f.Close()

	err = ctr.ItemService.ImportCSV(c, branchID, f)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.JSON(fiber.Map{
		"message": "Items imported successfully",
	})
}

func (i *ItemController) CreateTransaction(c *fiber.Ctx) error {
	req := new(validation.CreateItemTransaction)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"code":    fiber.StatusBadRequest,
			"message": "Invalid request body",
			"data":    nil,
		})
	}

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"code":    fiber.StatusBadRequest,
			"message": "Validation failed",
			"data":    err.Error(),
		})
	}

	transaction, err := i.ItemService.CreateTransaction(c, req)
	if err != nil {
		statusCode := fiber.StatusInternalServerError
		if strings.Contains(err.Error(), "insufficient stock") {
			statusCode = fiber.StatusBadRequest
		} else if strings.Contains(err.Error(), "not found") {
			statusCode = fiber.StatusNotFound
		}

		return c.Status(statusCode).JSON(fiber.Map{
			"status":  "error",
			"code":    statusCode,
			"message": err.Error(),
			"data":    nil,
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"code":    fiber.StatusCreated,
		"message": "Transaction created successfully",
		"data":    transaction,
	})
}

func (i *ItemController) GetAllTransactions(c *fiber.Ctx) error {
	params := new(validation.QueryItemTransaction)
	if err := c.QueryParser(params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"code":    fiber.StatusBadRequest,
			"message": "Invalid query parameters",
			"data":    nil,
		})
	}

	transactions, total, err := i.ItemService.GetTransactions(c, params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"code":    fiber.StatusInternalServerError,
			"message": err.Error(),
			"data":    nil,
		})
	}

	return c.JSON(fiber.Map{
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

func (i *ItemController) GetTransactions(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"code":    fiber.StatusBadRequest,
			"message": "Invalid item ID",
			"data":    nil,
		})
	}

	params := new(validation.QueryItemTransaction)
	if err := c.QueryParser(params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"code":    fiber.StatusBadRequest,
			"message": "Invalid query parameters",
			"data":    nil,
		})
	}

	transactions, total, err := i.ItemService.GetItemTransactions(c, uint(id), params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"code":    fiber.StatusInternalServerError,
			"message": err.Error(),
			"data":    nil,
		})
	}

	return c.JSON(fiber.Map{
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
