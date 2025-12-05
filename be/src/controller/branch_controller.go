package controller

import (
	"app/src/service"
	"app/src/validation"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type BranchController struct {
	Service service.BranchService
}

func NewBranchController(service service.BranchService) *BranchController {
	return &BranchController{
		Service: service,
	}
}

func (b *BranchController) Create(c *fiber.Ctx) error {
	var req validation.CreateBranch
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	branchResp, err := b.Service.Create(c, &req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(branchResp)
}

func (b *BranchController) GetAll(c *fiber.Ctx) error {
	branchesResp, err := b.Service.GetAll(c)
	if err != nil {
		return err
	}

	return c.JSON(branchesResp)
}

func (b *BranchController) GetByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid UUID")
	}

	branchResp, err := b.Service.GetByID(c, id)
	if err != nil {
		return err
	}

	return c.JSON(branchResp)
}

func (b *BranchController) Update(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid UUID")
	}

	var req validation.UpdateBranch
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	branchResp, err := b.Service.Update(c, id, &req)
	if err != nil {
		return err
	}

	return c.JSON(branchResp)
}

func (b *BranchController) Deactivate(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid UUID")
	}

	type DeactivateRequest struct {
		DeletedBy string `json:"deleted_by" validate:"required"`
	}
	var req DeactivateRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	branchResp, err := b.Service.Deactivate(c, id, req.DeletedBy)
	if err != nil {
		return err
	}

	return c.JSON(branchResp)
}

func (b *BranchController) Activate(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid UUID")
	}

	branchResp, err := b.Service.Activate(c, id)
	if err != nil {
		return err
	}

	return c.JSON(branchResp)
}
