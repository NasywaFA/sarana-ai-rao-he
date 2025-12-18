"use server";
import { requestToService } from "@/helpers/request";
import { ItemTransactionType, ItemType, ItemsResponse } from "../types/ItemType";
import { getCurrentBranch, getCurrentBranchWithDetails } from "./branchesService";
import { WasteLogType, CreateWasteLogPayload, UpdateWasteLogPayload } from "@/types/WasteLogType";
import { PaginationMetadataType } from "@/types/MiscType";

export async function getItems(
  page: number = 1,
  limit: number = 10,
  branchId: string = ""
): Promise<ItemsResponse> {
  try {
    const response = await requestToService(
      `v1/items?page=${page}&limit=${limit}${branchId ? `&branch_id=${branchId}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          isSuccess: false,
          data: [],
          message: jsonStr.message,
        };
      }

      console.error("Failed to fetch items");
      return { isSuccess: false, data: [], message: "Failed to fetch items" };
    }

    const jsonStr = await response.json();
    return {
      isSuccess: true,
      data: jsonStr.data,
      message: "Items retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    return {
      isSuccess: false,
      data: [],
      message: "An unexpected error occurred while fetching items",
    };
  }
}

export async function importItems(
  formData: FormData
): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    // Get current branch
    const branchId = await getCurrentBranch();
    if (!branchId.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to get current branch"
      }
    }

    const response = await requestToService(`v1/items/import-csv?branch_id=${branchId.data}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to import items", response.status);

      const jsonStr = await response.json();
      return { isSuccess: false, message: jsonStr.message || "Failed to import items" };
    }

    const jsonStr = await response.json();
    return {
      isSuccess: true,
      message: jsonStr.message,
    };
  } catch (error) {
    console.error("Error importing items:", error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred while importing items",
    };
  }
}

export async function createItem(
  item: ItemType
): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    // Get current branch
    const branch = await getCurrentBranchWithDetails();
    if (!branch.isSuccess) {
      return {
        isSuccess: false,
        message: 'Failed to get current branch'
      }
    }
    item.branch_id = branch.data!.id;

    const response = await requestToService(`v1/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const jsonStr = await response.json();
        return {
          isSuccess: false,
          message: jsonStr.message || "Validation error",
        };
      }
      console.error("Failed to create item");
      return { isSuccess: false, message: "Failed to create item" };
    }

    const jsonStr = await response.json();
    return {
      isSuccess: true,
      message: jsonStr.message || "Item created successfully",
    };
  } catch (error) {
    console.error("Error creating item:", error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred while creating item",
    };
  }
}

export async function updateItem(
  id: string,
  updatedItem: Partial<ItemType>
): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Update error:", errorData);
      return {
        isSuccess: false,
        message:
          errorData.message || `Update failed with status ${response.status}`,
      };
    }

    const responseData = await response.json();
    return {
      isSuccess: true,
      message: responseData.message || "Item updated successfully",
    };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      isSuccess: false,
      message: "Network error occurred while updating item",
    };
  }
}

export async function deleteItem(
  id: string
): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/items/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Delete error:", errorData);
      return {
        isSuccess: false,
        message:
          errorData.message || `Delete failed with status ${response.status}`,
      };
    }

    const responseData = await response.json();
    return {
      isSuccess: true,
      message: responseData.message || "Item deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      isSuccess: false,
      message: "Network error occurred while deleting item",
    };
  }
}

// TODO: Temporary disable this function
/*
export async function getItemById(id: string): Promise<{ isSuccess: boolean; data?: ItemType; message?: string }> {
    try {
        const response = await requestToService(`v1/items/${id}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    isSuccess: false,
                    message: "Item not found"
                };
            }
            console.error('Failed to fetch item');
            return { isSuccess: false, data: undefined, message: 'Failed to fetch item' };
        }

        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        console.error("Error fetching item:", error);
        return {
            isSuccess: false,
            message: "Failed to fetch item"
        };
    }
}

*/

export async function searchItems(
  search: string,
  page: number = 1,
  limit: number = 100
): Promise<ItemsResponse> {
  try {
    // Get current branch
    const branch = await getCurrentBranchWithDetails();
    if (!branch.isSuccess) {
      return {
        isSuccess: false,
        data: [],
        message: 'Failed to get current branch'
      }
    }

    const response = await requestToService(
      `v1/items?page=${page}&limit=${limit}&search=${encodeURIComponent(
        search
      )}&branch_id=${branch.data!.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          isSuccess: false,
          data: [],
          message: jsonStr.message,
        };
      }

      console.error("Failed to search items");
      return { isSuccess: false, data: [], message: "Failed to search items" };
    }

    const jsonStr = await response.json();
    return {
      isSuccess: true,
      data: jsonStr.items,
      message: "Items retrieved successfully",
    };
  } catch (error) {
    console.error("Error searching items:", error);
    return {
      isSuccess: false,
      data: [],
      message: "An unexpected error occurred while searching items",
    };
  }
}

// Waste Log CRUD
export async function getWasteLogsByItem(itemId: string): Promise<{ isSuccess: boolean; data: WasteLogType[]; message?: string }> {
  try {
    const response = await requestToService(`v1/items/${itemId}/waste-logs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, data: [], message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, data: json.data || json.waste_logs || [], message: json.message };
  } catch (error) {
    return { isSuccess: false, data: [], message: "Failed to fetch waste logs" };
  }
}

export async function createWasteLog(itemId: string, data: CreateWasteLogPayload): Promise<{ isSuccess: boolean; data?: WasteLogType; message?: string }> {
  try {
    const response = await requestToService(`v1/items/${itemId}/waste-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, data: json.data || json.waste_log, message: json.message };
  } catch (error) {
    return { isSuccess: false, message: "Failed to create waste log" };
  }
}

export async function updateWasteLog(itemId: string, id: string, data: UpdateWasteLogPayload): Promise<{ isSuccess: boolean; data?: WasteLogType; message?: string }> {
  try {
    const response = await requestToService(`v1/items/${itemId}/waste-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, data: json.data || json.waste_log, message: json.message };
  } catch (error) {
    return { isSuccess: false, message: "Failed to update waste log" };
  }
}

export async function deleteWasteLog(itemId: string, id: string): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/items/${itemId}/waste-logs/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete waste log" };
  }
}

// item transactions
export async function getItemTransactions(page: number = 1, limit: number = 10, search?: string): Promise<{ isSuccess: boolean; data: ItemTransactionType[]; paginationMetadata: PaginationMetadataType, message?: string }> {
  let paginationMetadata: PaginationMetadataType = {
    page,
    limit,
    totalPages: 0,
    totalResults: 0,
  }

  try {
    // Get current branch
    const branch = await getCurrentBranch();
    if (!branch.isSuccess) {
      return { isSuccess: false, data: [], paginationMetadata, message: "Failed to get current branch" };
    }
    
    const branchId = branch.data;
    
    const response = await requestToService(
      `v1/items/transactions?branch_id=${branchId}&page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, data: [], paginationMetadata, message: json.message };
    }
    const json = await response.json();

    paginationMetadata.totalPages = Math.ceil(json.data.total / limit);
    paginationMetadata.totalResults = json.data.total;

    return { isSuccess: true, data: json.data.transactions || [], paginationMetadata, message: json.message };
  } catch (error) {
    return { isSuccess: false, data: [], paginationMetadata, message: (error as Error).message || "Failed to fetch item transactions" };
  }
}

// transfer item between branches
export async function transferItem(body: {
  amount: number;
  from_branch_id: string;
  item_id: string;
  note: string;
  to_branch_id: string;
}): Promise<{ isSuccess: boolean; message: string }> {
  try {

    const response = await requestToService(`v1/items/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: body.item_id,
        from_branch_id: body.from_branch_id,
        to_branch_id: body.to_branch_id,
        amount: body.amount,
        note: body.note,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { 
        isSuccess: false, 
        message: json.message || "Failed to transfer item" 
      };
    }

    return { 
      isSuccess: true, 
      message: json.message || "Item transferred successfully" 
    };
  } catch (error) {
    console.error("Transfer item error:", error);
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to transfer item" 
    };
  }
}