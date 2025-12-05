import { ItemTypeWithQuantity, ItemTypeWithQuantityAndNotEnoughItems } from "./ItemType";

export interface ForecastItem {
  recipe_code: string;
  recipe_name: string;
  type: "real" | "forecast";
  value: number;
  is_ingredients_enough: boolean;
  not_enough_items: ItemTypeWithQuantityAndNotEnoughItems[];
}

export interface ForecastData {
  date: string;
  total: number;
  type: string;
  items: ForecastItem[];
}

export interface ForecastResponse {
  code: number;
  status: string;
  message: string;
  data: ForecastData[];
  retrieved_at: string;
}

export interface ForecastServiceResponse {
  isSuccess: boolean;
  data: ForecastData[];
  message: string;
} 