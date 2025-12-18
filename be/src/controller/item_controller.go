package controller

import (
	"app/src/service"
	"app/src/validation"

	"github.com/gofiber/fiber/v2"
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

func (i *ItemController) ImportCSV(c *fiber.Ctx) error {
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

	err = i.ItemService.ImportCSV(c, branchID, f)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.JSON(fiber.Map{
		"message": "Items imported successfully",
	})
}