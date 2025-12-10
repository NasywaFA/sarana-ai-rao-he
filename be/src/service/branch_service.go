package service

import (
	"app/src/model"
	"app/src/response"
	"app/src/validation"
	"errors"
	"time"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"

	"app/src/utils"
)

type BranchService interface {
	Create(c *fiber.Ctx, req *validation.CreateBranch) (*response.BranchResponse, error)
	GetAll(c *fiber.Ctx) (*response.BranchListResponse, error)
	GetByID(c *fiber.Ctx, id uuid.UUID) (*response.BranchResponse, error)
	Update(c *fiber.Ctx, id uuid.UUID, req *validation.UpdateBranch) (*response.BranchResponse, error)
	Deactivate(c *fiber.Ctx, id uuid.UUID, deletedBy string) (*response.BranchResponse, error)
	Activate(c *fiber.Ctx, id uuid.UUID) (*response.BranchResponse, error)
}

type branchService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewBranchService(db *gorm.DB, validate *validator.Validate) BranchService {
	_ = validate.RegisterValidation("emailcsv", func(fl validator.FieldLevel) bool {
    value := fl.Field().String()
    if value == "" {
        return true
    }
    emails := strings.Split(value, ",")
    for _, email := range emails {
        email = strings.TrimSpace(email)
        if err := validator.New().Var(email, "email"); err != nil {
            return false
        }
    }
    return true
})

	return &branchService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (s *branchService) Create(c *fiber.Ctx, req *validation.CreateBranch) (*response.BranchResponse, error) {
	if err := s.Validate.Struct(req); err != nil {
		return nil, err
	}

	branch := &model.Branch{
		Name:             req.Name,
		Slug:             req.Slug,
		PicEmails:        req.PicEmails,
		PicPhoneNumbers:  req.PicPhoneNumbers,
	}

	if err := s.DB.WithContext(c.Context()).Create(branch).Error; err != nil {
		s.Log.Errorf("Failed create branch: %+v", err)
		return nil, err
	}

	return s.mapBranchToResponse(branch), nil
}

func (s *branchService) GetAll(c *fiber.Ctx) (*response.BranchListResponse, error) {
	var branches []model.Branch
	if err := s.DB.WithContext(c.Context()).Find(&branches).Error; err != nil {
		return nil, err
	}

	list := make([]response.BranchResponse, len(branches))
	for i, b := range branches {
		list[i] = *s.mapBranchToResponse(&b) // dereference pointer ke struct
	}

	return &response.BranchListResponse{Branches: list}, nil
}

func (s *branchService) GetByID(c *fiber.Ctx, id uuid.UUID) (*response.BranchResponse, error) {
	var branch model.Branch
	err := s.DB.WithContext(c.Context()).First(&branch, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fiber.NewError(fiber.StatusNotFound, "Branch not found")
	}
	if err != nil {
		return nil, err
	}

	return s.mapBranchToResponse(&branch), nil
}

func (s *branchService) Update(c *fiber.Ctx, id uuid.UUID, req *validation.UpdateBranch) (*response.BranchResponse, error) {
	if err := s.Validate.Struct(req); err != nil {
		return nil, err
	}

	var branch model.Branch
	if err := s.DB.WithContext(c.Context()).First(&branch, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Branch not found")
		}
		return nil, err
	}

	branch.Name = req.Name
	branch.Slug = req.Slug
	branch.PicEmails = req.PicEmails
	branch.PicPhoneNumbers = req.PicPhoneNumbers

	if err := s.DB.Save(&branch).Error; err != nil {
		return nil, err
	}

	return s.mapBranchToResponse(&branch), nil
}

func (s *branchService) Deactivate(c *fiber.Ctx, id uuid.UUID, deletedBy string) (*response.BranchResponse, error) {
	var branch model.Branch
	if err := s.DB.WithContext(c.Context()).First(&branch, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Branch not found")
		}
		return nil, err
	}

	now := time.Now()
	branch.DeletedAt = &now
	branch.DeletedBy = &deletedBy

	if err := s.DB.Save(&branch).Error; err != nil {
		return nil, err
	}

	return s.mapBranchToResponse(&branch), nil
}

func (s *branchService) Activate(c *fiber.Ctx, id uuid.UUID) (*response.BranchResponse, error) {
	var branch model.Branch
	if err := s.DB.WithContext(c.Context()).First(&branch, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Branch not found")
		}
		return nil, err
	}

	branch.DeletedAt = nil
	branch.DeletedBy = nil

	if err := s.DB.Save(&branch).Error; err != nil {
		return nil, err
	}

	return s.mapBranchToResponse(&branch), nil
}

// mapBranchToResponse selalu return pointer
func (s *branchService) mapBranchToResponse(b *model.Branch) *response.BranchResponse {
	deletedAt := ""
	if b.DeletedAt != nil {
		deletedAt = b.DeletedAt.Format(time.RFC3339)
	}

	deletedBy := ""
	if b.DeletedBy != nil {
		deletedBy = *b.DeletedBy
	}

	return &response.BranchResponse{
		ID:              b.ID.String(),
		Name:            b.Name,
		Slug:            b.Slug,
		PicEmails:       b.PicEmails,
		PicPhoneNumbers: b.PicPhoneNumbers,
		CreatedAt:       b.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       b.UpdatedAt.Format(time.RFC3339),
		DeletedAt:       deletedAt,
		DeletedBy:       deletedBy,
	}
}
