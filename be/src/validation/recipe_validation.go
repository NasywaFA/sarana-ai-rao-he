package validation

type CreateRecipe struct {
    BranchID    string `json:"branch_id" validate:"required,uuid"`
    Name        string `json:"name" validate:"required"`
    Description string `json:"description"`
    Ingredients string `json:"ingredients"`
    Instruction string `json:"instruction"`
    CreatedBy   string `json:"created_by" validate:"required,uuid"`
}

type UpdateRecipe struct {
    BranchID    *string `json:"branch_id" validate:"omitempty,uuid"`
    Name        *string `json:"name" validate:"omitempty"`
    Description *string `json:"description" validate:"omitempty"`
    Ingredients *string `json:"ingredients" validate:"omitempty"`
    Instruction *string `json:"instruction" validate:"omitempty"`
}