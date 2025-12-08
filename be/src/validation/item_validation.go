package validation

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
	Search   string `json:"search" form:"search"`
	BranchID string `json:"branch_id" form:"branch_id"`
	Page     int    `json:"page" form:"page" validate:"omitempty,min=1"`
	Limit    int    `json:"limit" form:"limit" validate:"omitempty,min=1,max=100"`
}