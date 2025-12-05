import { BranchType } from "./BranchType";

export interface ItemType {
  id?: string;
  code: string;
  name: string;
  stock: number;
  unit: string;
  type: string;
  lead_time: number;
  
  branch?: BranchType;
  branch_id?: string;

  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ItemTypeWithQuantity extends ItemType {
  quantity: number;
}

export interface ItemTypeWithQuantityAndNotEnoughItems extends ItemTypeWithQuantity {
  not_enough_items: ItemTypeWithQuantityAndNotEnoughItems[];
}

export interface ItemTransactionType {
  id?: string;
  amount: number;
  current_stock: number;
  type: "in" | "out";
  note?: string;

  item_id: string;
  item: ItemType;

  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ItemsResponse {
  isSuccess: boolean;
  data: ItemType[];
  message?: string;
}