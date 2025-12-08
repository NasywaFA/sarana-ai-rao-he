package model

import (
	"time"
	"github.com/google/uuid"
)

type Item struct {
    ID        uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
    BranchID  string     `json:"branch_id" gorm:"type:uuid;not null"`
    Code      string     `json:"code"`
    Name      string     `json:"name"`
    Type      string     `json:"type"`
    Stock     int        `json:"stock"`
    Unit      string     `json:"unit"`
    LeadTime  int        `json:"lead_time"`
    CreatedAt time.Time  `json:"created_at"`
    UpdatedAt time.Time  `json:"updated_at"`
    DeletedAt *time.Time `json:"deleted_at"`
}
