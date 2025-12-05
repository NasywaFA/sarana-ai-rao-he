package service

import (
	"app/src/config"
	"app/src/model"
	"app/src/response"
	"app/src/utils"
	"app/src/validation"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(c *fiber.Ctx, req *validation.Register) (*model.User, error)
	Login(c *fiber.Ctx, req *validation.Login) (*model.User, *model.Branch, error)
	Logout(c *fiber.Ctx, req *validation.Logout) error
	RefreshAuth(c *fiber.Ctx, req *validation.RefreshToken) (*response.Tokens, error)
	ResetPassword(c *fiber.Ctx, query *validation.Token, req *validation.UpdatePassOrVerify) error
	VerifyEmail(c *fiber.Ctx, query *validation.Token) error
	GetActiveBranch(c *fiber.Ctx, userID string) (*response.ActiveBranchResponse, error)

}

type authService struct {
	Log          *logrus.Logger
	DB           *gorm.DB
	Validate     *validator.Validate
	UserService  UserService
	TokenService TokenService
}

func NewAuthService(
	db *gorm.DB, validate *validator.Validate, userService UserService, tokenService TokenService,
) AuthService {
	return &authService{
		Log:          utils.Log,
		DB:           db,
		Validate:     validate,
		UserService:  userService,
		TokenService: tokenService,
	}
}

func (s *authService) Register(c *fiber.Ctx, req *validation.Register) (*model.User, error) {
	if err := s.Validate.Struct(req); err != nil {
		return nil, err
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		s.Log.Errorf("Failed hash password: %+v", err)
		return nil, err
	}

	user := &model.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
	}

	result := s.DB.WithContext(c.Context()).Create(user)
	if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
		return nil, fiber.NewError(fiber.StatusConflict, "Email already taken")
	}

	if result.Error != nil {
		s.Log.Errorf("Failed create user: %+v", result.Error)
	}

	return user, result.Error
}

func (s *authService) Login(c *fiber.Ctx, req *validation.Login) (*model.User, *model.Branch, error) {
	if err := s.Validate.Struct(req); err != nil {
		return nil, nil, err
	}

	user, err := s.UserService.GetUserByEmail(c, req.Email)
	if err != nil {
		return nil, nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid email or password")
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid email or password")
	}

	var branch model.Branch
	result := s.DB.First(&branch, "id = ?", req.BranchID)
	if result.Error != nil {
		return nil, nil, fiber.NewError(fiber.StatusBadRequest, "Selected branch not found")
	}

	s.DB.Where("user_id = ?", user.ID).Delete(&model.ActiveBranch{})

	active := &model.ActiveBranch{
		UserID: user.ID,
		BranchID: branch.ID,
	}

	if err := s.DB.Create(active).Error; err != nil {
		return nil, nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to set active branch")
	}

	return user, &branch, nil

}

func (s *authService) GetActiveBranch(c *fiber.Ctx, userID string) (*response.ActiveBranchResponse, error) {
    var active model.ActiveBranch

    if err := s.DB.Where("user_id = ?", userID).First(&active).Error; err != nil {
        return nil, fiber.NewError(fiber.StatusNotFound, "Active branch not found")
    }

    var branch model.Branch
    if err := s.DB.First(&branch, "id = ?", active.BranchID).Error; err != nil {
        return nil, fiber.NewError(fiber.StatusNotFound, "Branch not found")
    }

    return &response.ActiveBranchResponse{
        ID:   branch.ID.String(),
        Name: branch.Name,
    }, nil
}

func (s *authService) Logout(c *fiber.Ctx, req *validation.Logout) error {
	if err := s.Validate.Struct(req); err != nil {
		return err
	}

	token, err := s.TokenService.GetTokenByUserID(c, req.RefreshToken)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Token not found")
	}

    if err := s.TokenService.DeleteToken(c, config.TokenTypeRefresh, token.UserID.String()); err != nil {
        return err
    }
	    if err := s.DB.Where("user_id = ?", token.UserID).Delete(&model.ActiveBranch{}).Error; err != nil {
        return fiber.NewError(fiber.StatusInternalServerError, "Failed to clear active branch")
    }

    return nil
}

func (s *authService) RefreshAuth(c *fiber.Ctx, req *validation.RefreshToken) (*response.Tokens, error) {
	if err := s.Validate.Struct(req); err != nil {
		return nil, err
	}

	token, err := s.TokenService.GetTokenByUserID(c, req.RefreshToken)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	user, err := s.UserService.GetUserByID(c, token.UserID.String())
	if err != nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	newTokens, err := s.TokenService.GenerateAuthTokens(c, user)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return newTokens, err
}

func (s *authService) ResetPassword(c *fiber.Ctx, query *validation.Token, req *validation.UpdatePassOrVerify) error {
	if err := s.Validate.Struct(query); err != nil {
		return err
	}

	userID, err := utils.VerifyToken(query.Token, config.JWTSecret, config.TokenTypeResetPassword)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid Token")
	}

	user, err := s.UserService.GetUserByID(c, userID)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Password reset failed")
	}

	if errUpdate := s.UserService.UpdatePassOrVerify(c, req, user.ID.String()); errUpdate != nil {
		return errUpdate
	}

	if errToken := s.TokenService.DeleteToken(c, config.TokenTypeResetPassword, user.ID.String()); errToken != nil {
		return errToken
	}

	return nil
}

func (s *authService) VerifyEmail(c *fiber.Ctx, query *validation.Token) error {
	if err := s.Validate.Struct(query); err != nil {
		return err
	}

	userID, err := utils.VerifyToken(query.Token, config.JWTSecret, config.TokenTypeVerifyEmail)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid Token")
	}

	user, err := s.UserService.GetUserByID(c, userID)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Verify email failed")
	}

	if errToken := s.TokenService.DeleteToken(c, config.TokenTypeVerifyEmail, user.ID.String()); errToken != nil {
		return errToken
	}

	updateBody := &validation.UpdatePassOrVerify{
		VerifiedEmail: true,
	}

	if errUpdate := s.UserService.UpdatePassOrVerify(c, updateBody, user.ID.String()); errUpdate != nil {
		return errUpdate
	}

	return nil
}
