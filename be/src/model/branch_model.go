package model

import (
	"time"
	"github.com/google/uuid"
)

type Branch struct {
	ID               uuid.UUID  `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Name             string     `gorm:"not null;unique" json:"name"`
	Slug             string     `gorm:"not null;unique" json:"slug"`
	PicEmails        string     `gorm:"default:''" json:"pic_emails"`
	PicPhoneNumbers  string     `gorm:"default:''" json:"pic_phone_numbers"`
	CreatedBy        *string    `json:"created_by,omitempty"`
	UpdatedBy        *string    `json:"updated_by,omitempty"`
	DeletedBy        *string    `json:"deleted_by,omitempty"`
	DeletedAt        *time.Time `json:"deleted_at,omitempty"`
	CreatedAt        time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}
