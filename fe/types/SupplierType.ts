import { ItemType } from "./ItemType";

export interface SupplierType {
  id: string;
  name: string;
  slug: string;
  address: string;
  whatsapp_number: string;
  phone_number: string;
  items?: ItemType[];

  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface SuppliersResponse {
  isSuccess: boolean;
  data: SupplierType[];
  message?: string;
}

export interface SupplierResponse {
  isSuccess: boolean;
  data?: SupplierType;
  message?: string;
}

// Supplier Item Relationship Types
export interface SupplierItemType {
  supplier_id: string;
  item_id: string;
  supplier?: SupplierType;
  item?: ItemType;
  moq: number;
  price: number;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // // Optionally, include item details
  // item?: import("./ItemType").ItemType;
}

export interface SupplierItemsPaginatedResponse {
  isSuccess: boolean;
  data: SupplierItemType[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface SupplierItemResponse {
  isSuccess: boolean;
  data?: SupplierItemType;
  message?: string;
}

export interface SupplierItemsForItemResponse {
  isSuccess: boolean;
  data: SupplierItemType[];
  message?: string;
} 