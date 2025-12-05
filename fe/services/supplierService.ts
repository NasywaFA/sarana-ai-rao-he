"use server";
import { requestToService } from "@/helpers/request";
import { SupplierType, SuppliersResponse, SupplierResponse, SupplierItemType, SupplierItemsPaginatedResponse, SupplierItemResponse, SupplierItemsForItemResponse } from "../types/SupplierType";

// --- SUPPLIER CRUD ---
export async function getSuppliers(page: number = 1, limit: number = 10, search?: string): Promise<SuppliersResponse> {
  try {
    let url = `v1/suppliers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await requestToService(url, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, data: [], message: json.message };
    }
    const json = await response.json();
    return {
      isSuccess: true,
      data: json.results || [],
      message: json.message || "Suppliers retrieved successfully"
    };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error fetching suppliers:', error);
    return { isSuccess: false, data: [], message: 'An unexpected error occurred while fetching suppliers' };
  }
}

export async function getSupplierById(id: string): Promise<SupplierResponse> {
  try {
    const response = await requestToService(`v1/suppliers/${id}`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return {
      isSuccess: true,
      data: json,
      message: json.message || "Supplier retrieved successfully"
    };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error fetching supplier:', error);
    return { isSuccess: false, message: "Failed to fetch supplier" };
  }
}

export async function createSupplier(supplier: Omit<SupplierType, 'id' | 'created_at' | 'updated_at'>): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/suppliers`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Supplier created successfully" };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error creating supplier:', error);
    return { isSuccess: false, message: "Failed to create supplier" };
  }
}

export async function updateSupplier(id: string, updatedSupplier: Partial<SupplierType>): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/suppliers/${id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSupplier),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Supplier updated successfully" };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error updating supplier:', error);
    return { isSuccess: false, message: "Failed to update supplier" };
  }
}

export async function deleteSupplier(id: string): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/suppliers/${id}`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Supplier deleted successfully" };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error deleting supplier:', error);
    return { isSuccess: false, message: "Failed to delete supplier" };
  }
}

// --- SUPPLIER ITEM CRUD ---
export async function getSupplierItems(supplierId: string, page: number = 1, limit: number = 10, search?: string, itemId?: string): Promise<SupplierItemsPaginatedResponse> {
  try {
    let url = `v1/suppliers/${supplierId}/items?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (itemId) url += `&item_id=${encodeURIComponent(itemId)}`;
    const response = await requestToService(url, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, data: [], total: 0, page, limit, message: json.message };
    }
    const json = await response.json();
    return {
      isSuccess: true,
      data: json.results,
      total: json.total_pages || 0,
      page: json.page || page,
      limit: json.limit || limit,
      message: json.message || "Supplier items retrieved successfully"
    };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error fetching supplier items:', error);
    return { isSuccess: false, data: [], total: 0, page, limit, message: 'An unexpected error occurred while fetching supplier items' };
  }
}

export async function getSupplierItem(supplierId: string, itemId: string): Promise<SupplierItemResponse> {
  try {
    const response = await requestToService(`v1/suppliers/${supplierId}/items/${itemId}`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return {
      isSuccess: true,
      data: json.data || json.item,
      message: json.message || "Supplier item retrieved successfully"
    };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error fetching supplier item:', error);
    return { isSuccess: false, message: "Failed to fetch supplier item" };
  }
}

export async function createSupplierItem(supplierId: string, data: Partial<SupplierItemType>): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/suppliers/${supplierId}/items`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Supplier item created successfully" };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error creating supplier item:', error);
    return { isSuccess: false, message: "Failed to create supplier item" };
  }
}

export async function updateSupplierItem(supplierId: string, itemId: string, data: Partial<SupplierItemType>): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/suppliers/${supplierId}/items/${itemId}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Supplier item updated successfully" };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error updating supplier item:', error);
    return { isSuccess: false, message: "Failed to update supplier item" };
  }
}

export async function deleteSupplierItem(supplierId: string, itemId: string): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/suppliers/${supplierId}/items/${itemId}`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Supplier item deleted successfully" };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error deleting supplier item:', error);
    return { isSuccess: false, message: "Failed to delete supplier item" };
  }
}

export async function getSuppliersForItem(itemId: string, search?: string): Promise<SupplierItemsForItemResponse> {
  try {
    let url = `v1/suppliers/items/${itemId}`;
    if (search) url += `?search=${encodeURIComponent(search)}`;
    const response = await requestToService(url, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, data: [], message: json.message };
    }
    const json = await response.json();
    return {
      isSuccess: true,
      data: json.supplier_items,
      message: json.message || "Suppliers for item retrieved successfully"
    };
  } catch (error) {
    console.error('[SUPPLIER SERVICE] Error fetching suppliers for item:', error);
    return { isSuccess: false, data: [], message: 'An unexpected error occurred while fetching suppliers for item' };
  }
}