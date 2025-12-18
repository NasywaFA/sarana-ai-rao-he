package model

import (
	"time"

	"github.com/google/uuid"
)

type RecipeIngredient struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	BranchID  string     `json:"branch_id" gorm:"type:uuid;not null"`
	RecipeID  string     `gorm:"type:uuid;not null;index" json:"recipe_id"`
	ItemID    string     `gorm:"type:uuid;not null;index" json:"item_id"`
	Item      *Item      `gorm:"foreignKey:ItemID" json:"item,omitempty"`
	Quantity  float64    `gorm:"not null" json:"quantity"`
	Unit      string     `gorm:"type:varchar(50);not null" json:"unit"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}

func (RecipeIngredient) TableName() string {
	return "recipe_ingredients"
}
