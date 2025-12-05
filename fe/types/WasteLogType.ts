import { ItemType } from "./ItemType";
import { RecipeType } from "./RecipeType";

export interface WasteLogType {
    id: string;
    date: string;
    note?: string; // Optional note for the waste
    waste_type: string;
    waste_quantity: number;
    current_stock?: number;

    item_id: string;
    recipe_id?: string; // Optional relation to recipe, if not provided, it means the waste is not related to a recipe
    recipe?: RecipeType;
    item?: ItemType;

    created_by?: string;
    updated_by?: string;
    deleted_by?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreateWasteLogPayload {
    date: string;
    note?: string;
    waste_type: string;
    waste_quantity: number;
    recipe_id?: string;
}

export interface UpdateWasteLogPayload {
    date?: string;
    note?: string;
    waste_type?: string;
    waste_quantity?: number;
    recipe_id?: string;
}