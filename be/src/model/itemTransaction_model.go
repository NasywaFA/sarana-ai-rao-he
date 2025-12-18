package model

import (
	"time"

	"github.com/google/uuid"
)

type ItemTransaction struct {
	ID              uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ItemID          uuid.UUID  `gorm:"not null;index" json:"item_id"`
	BranchID        string     `gorm:"not null;index" json:"branch_id"`
	FromBranchID    *string    `gorm:"-" json:"from_branch_id,omitempty"`
	ToBranchID      *string    `gorm:"-" json:"to_branch_id,omitempty"`
	Type            string     `gorm:"type:varchar(20);not null" json:"type"` // in, out, transfer_in, transfer_out, cook_in, cook_out
	Amount          float64    `gorm:"not null" json:"amount"`
	CurrentStock    float64    `gorm:"not null" json:"current_stock"`
	Note            string     `gorm:"type:text" json:"note"`
	TransactionDate time.Time  `gorm:"not null" json:"transaction_date"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	DeletedAt       *time.Time `json:"deleted_at"`

	Item   Item   `gorm:"foreignKey:ItemID;references:ID" json:"item,omitempty"`
	Branch Branch `gorm:"foreignKey:BranchID;references:ID" json:"branch,omitempty"`
}

func (ItemTransaction) TableName() string {
	return "item_transactions"
}
