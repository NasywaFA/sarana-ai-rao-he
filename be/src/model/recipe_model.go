package model

import (
	"time"
    
	"github.com/google/uuid"
)

type Recipe struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
    BranchID  	string     `json:"branch_id" gorm:"type:uuid;not null"`
    Name        string     `json:"name"`
    Description string     `json:"description"`
    Ingredients string     `json:"ingredients"`
    Instruction string     `json:"instruction"`
	CreatedBy 	string	   `json:"created_by"`
    CreatedAt   time.Time  `json:"created_at"`
    UpdatedAt   time.Time  `json:"updated_at"`
    DeletedAt   *time.Time `json:"deleted_at"`
}
