package model

import (
	"time"

    "github.com/google/uuid"
)

type ItemTransaction struct {
    ID           uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	BranchID     string         `gorm:"not null;index" json:"branch_id"`
	ItemID       uuid.UUID      `gorm:"not null;index" json:"item_id"`
	Item         Item           `gorm:"foreignKey:ItemID" json:"item,omitempty"`
	Type         string         `gorm:"type:varchar(10);not null" json:"type"` // "in" or "out"
	Amount       float64        `gorm:"not null" json:"amount"`
	CurrentStock float64        `gorm:"not null" json:"current_stock"`
	Note         string         `gorm:"type:text" json:"note"`
	TransactionDate time.Time   `gorm:"not null" json:"transaction_date"`
    CreatedAt    time.Time  `json:"created_at"`
    UpdatedAt    time.Time  `json:"updated_at"`
    DeletedAt    *time.Time `json:"deleted_at"`
}

func (ItemTransaction) TableName() string {
	return "item_transactions"
}