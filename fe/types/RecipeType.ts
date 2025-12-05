export interface RecipeType {
  id?: string;
  branch_id: string;
  code: string;
  name: string;
  type: string;
}

export interface RecipesResponse {
  isSuccess: boolean;
  data: RecipeType[];
  message?: string;
}

// Recipe Item Relationship Types
export interface RecipeItemType {
  recipe_id: string;
  item_id: string;
  quantity: number;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  // Item details (for display purposes)
  item?: {
    id: string;
    code: string;
    name: string;
    stock: number;
    type: string;
    unit: string;
  };
}

export interface RecipeItemsResponse {
  isSuccess: boolean;
  data: RecipeItemType[];
  message?: string;
}

export interface RecipeItemResponse {
  isSuccess: boolean;
  data?: RecipeItemType;
  message?: string;
}

// Legacy types for backward compatibility
export interface RecipeIngredientsResponse {
  code: number;
  status: string;
  message: string;
  recipe_ingredients: RecipeItemType[];
}
