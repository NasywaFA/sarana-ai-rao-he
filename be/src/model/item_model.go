package model

import (
	"time"

	"github.com/google/uuid"
)

type Item struct {
    ID        uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
    BranchID  string     `json:"branch_id" gorm:"type:uuid;not null"`
    Code      string     `json:"code" gorm:"type:varchar(50);uniqueIndex:idx_code_branch;not null" `
	Name      string     `json:"name" gorm:"type:varchar(255);not null"`
	Type      string     `json:"type" gorm:"type:varchar(50);not null" `
	Unit      string     `json:"unit" gorm:"type:varchar(50);not null"`
    Stock     float64    `json:"stock" gorm:"not null;default:0" `
    LeadTime  int        `json:"lead_time" gorm:"not null;default:0" `
    CreatedAt time.Time  `json:"created_at"`
    UpdatedAt time.Time  `json:"updated_at"`
    DeletedAt *time.Time `json:"deleted_at"`
}

func (Item) TableName() string {
	return "items"
}