import { RecipeType } from "./RecipeType";

export interface SalesType {
  id: string;
  date: string;
  recipe_id: string;
  recipe_name: string;
  quantity: number;
  recipe: RecipeType;
}

export interface SalesResponse {
  isSuccess: boolean;
  data: SalesType[];
  message?: string;
} 