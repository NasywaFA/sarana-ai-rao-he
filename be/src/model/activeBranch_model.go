package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ActiveBranch struct {
	ID			uuid.UUID `gorm:"primaryKey" json:"id"`
	UserID		uuid.UUID `gorn:"uniqueIndex" json:""user_id`
	BranchID	uuid.UUID `json:"branch_id"`
	UpdatedAt	time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (ab *ActiveBranch) BeforeCreate(tx *gorm.DB) error {
    ab.ID = uuid.New()
    return nil
}
