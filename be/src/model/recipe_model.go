package model

import (
	"time"
    
	"github.com/google/uuid"
)

type Recipe struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
    BranchID  	string     `json:"branch_id" gorm:"type:uuid;not null"`
    Code        string     `json:"code" gorm:"type:varchar(50);uniqueIndex:idx_code_branch;not null" `
    Name        string     `json:"name" gorm:"type:varchar(255);not null"`
    Type        string     `json:"type" gorm:"type:varchar(50);not null"` // half_finished, finished
    Description string     `json:"description" gorm:"type:text"`
    Instruction string     `json:"instructions" gorm:"type:text"`
    CreatedBy   string     `json:"created_by" gorm:"type:uuid;not null"`
    CreatedAt   time.Time  `json:"created_at"`
    UpdatedAt   time.Time  `json:"updated_at"`
    DeletedAt   *time.Time `json:"deleted_at"`

    Ingredients []RecipeIngredient  `gorm:"foreignKey:RecipeID;constraint:OnDelete:CASCADE" json:"ingredients,omitempty"`
}

func (Recipe) TableName() string {
	return "recipes"
}