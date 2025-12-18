package validation

type CreateRecipeIngredient struct {
    ItemID   string  `json:"item_id" validate:"required,uuid"`
    Quantity float64 `json:"quantity" validate:"required,gt=0"`
    Unit     string  `json:"unit" validate:"required"`
}

type CreateRecipe struct {
    BranchID    string `json:"branch_id" validate:"required,uuid"`
    Code        string `json:"code" validate:"required"`
    Name        string `json:"name" validate:"required"`
    Type        string `json:"type" validate:"required"`
    Description string `json:"description"`
    Instruction string `json:"instruction"`
    CreatedBy   string `json:"created_by" validate:"required,uuid"`
    Ingredients []CreateRecipeIngredient `json:"ingredients" validate:"required,dive"`
}

type UpdateRecipe struct {
    Code        string `json:"code" validate:"omitempty"`
    Name        string `json:"name" validate:"omitempty"`
    Type        string `json:"type" validate:"omitempty"`
    Description string `json:"description" validate:"omitempty"`
    Instruction string `json:"instruction" validate:"omitempty"`
    Ingredients []CreateRecipeIngredient `json:"ingredients" validate:"omitempty, dive"`
}

type CookRecipe struct {
    ServeCount int `json:"serve_count" validate:"required,gt=0"`
}

type QueryRecipe struct {
    BranchID string `query:"branch_id" validate:"required,uuid"`
    Page     int    `query:"page"`
    Limit    int    `query:"limit"`
}
