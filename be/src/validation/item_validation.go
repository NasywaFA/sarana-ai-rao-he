package validation

import (
	"time"

	"github.com/google/uuid"
)

type CreateItem struct {
	BranchID string `json:"branch_id" validate:"required,uuid"`
	Code     string `json:"code" validate:"required"`
	Name     string `json:"name" validate:"required"`
	Type     string `json:"type" validate:"required"`
	Stock    int    `json:"stock" validate:"required,min=0"`
	Unit     string `json:"unit" validate:"required"`
	LeadTime int    `json:"lead_time" validate:"required,min=0"`
}

type UpdateItem struct {
	BranchID *string `json:"branch_id" validate:"omitempty,uuid"`
	Code     *string `json:"code" validate:"omitempty"`
	Name     *string `json:"name" validate:"omitempty"`
	Type     *string `json:"type" validate:"omitempty"`
	Stock    *int    `json:"stock" validate:"omitempty,min=0"`
	Unit     *string `json:"unit" validate:"omitempty"`
	LeadTime *int    `json:"lead_time" validate:"omitempty,min=0"`
}

type QueryItem struct {
	Page     int    `query:"page" validate:"required,min=1"`
	Limit    int    `query:"limit" validate:"required,min=1"`
	BranchID string `query:"branch_id"`
	Search   string `query:"search"`
}

type TransferItem struct {
	ItemID       string  `json:"item_id" validate:"required,uuid"`
	FromBranchID string  `json:"from_branch_id" validate:"required,uuid"`
	ToBranchID   string  `json:"to_branch_id" validate:"required,uuid"`
	Amount       float64 `json:"amount" validate:"required,gt=0"`
	Type         string  `json:"type" validate:"required,oneof=transfer_in transfer_out"`
	Note         string  `json:"note"`
}

type CreateItemTransaction struct {
	ItemID          uuid.UUID `json:"item_id" validate:"required"`
	BranchID        string    `json:"branch_id" validate:"required"`
	FromBranchID    string    `json:"from_branch_id,omitempty"`
	ToBranchID      string    `json:"to_branch_id,omitempty"`
	Type            string    `json:"type" validate:"required,oneof=in out transfer_in transfer_out"`
	Amount          float64   `json:"amount" validate:"required,gt=0"`
	Note            string    `json:"note"`
	TransactionDate time.Time `json:"transaction_date"`
}

type QueryItemTransaction struct {
	Page     int        `query:"page"`
	Limit    int        `query:"limit"`
	ItemID   *string    `query:"item_id"`
	BranchID string     `query:"branch_id"`
	Type     string     `query:"type"`
	FromDate *time.Time `query:"from_date"`
	ToDate   *time.Time `query:"to_date"`
}
