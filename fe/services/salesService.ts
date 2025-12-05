"use server";
import { requestToService } from "@/helpers/request";
import { SalesType, SalesResponse } from "../types/SalesType";
import { getCurrentBranch } from "./branchesService";

export async function getSales(page: number = 1, limit: number = 10, branchId: string = ""): Promise<SalesResponse> {
  try {
    const response = await requestToService(`v1/sales?page=${page}&limit=${limit}${branchId ? `&branch_id=${branchId}` : ""}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          isSuccess: false, 
          data: [], 
          message: jsonStr.message
        };
      }

      console.error('Failed to fetch sales');
      return { isSuccess: false, data: [], message: 'Failed to fetch sales' };
    }

    const jsonStr = await response.json();
    return {
      isSuccess: true,
      data: jsonStr.sales,
      message: "Sales retrieved successfully"
    };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return { isSuccess: false, data: [], message: 'An unexpected error occurred while fetching sales' };
  }
}

export async function importSales(formData: FormData): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/sales/import-csv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return { success: false, message: 'Failed to import sales' };
    }

    const jsonStr = await response.json();
    return {
      success: true,
      message: jsonStr.message
    };
  } catch (error) {
    console.error('Error importing sales:', error);
    return { success: false, message: 'An unexpected error occurred while importing sales' };
  }
}

export async function importQuinosSales(formData: FormData, date: string, forceImport: boolean): Promise<{ success: boolean; message?: string; not_found_product_codes?: string[] }> {
  try {
    // Get current branchId
    const branchId = await getCurrentBranch();
    if (!branchId.isSuccess) {
      return { success: false, message: 'Failed to get current branch' };
    }

    const response = await requestToService(`v1/sales/import-quinos?branch_id=${branchId.data}&is_forced=${String(forceImport)}&date=${date}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const jsonStr = await response.json();
      return { success: false, message: jsonStr.message || 'Failed to import sales', not_found_product_codes: jsonStr.not_found_product_codes || [] };
    }

    const jsonStr = await response.json();
    return {
      success: true,
      message: jsonStr.message
    };
  } catch (error) {
    console.error('Error importing sales:', error);
    return { success: false, message: 'An unexpected error occurred while importing sales' };
  }
}

export async function importIsellerSales(formData: FormData, forceImport: boolean): Promise<{ success: boolean; message?: string; not_found_product_codes?: string[] }> {
  try {
    // Get current branchId
    const branchId = await getCurrentBranch();
    if (!branchId.isSuccess) {
      return { success: false, message: 'Failed to get current branch' };
    }

    const response = await requestToService(`v1/sales/import-iseller?branch_id=${branchId.data}&is_forced=${String(forceImport)}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const jsonStr = await response.json();
      return { success: false, message: jsonStr.message || 'Failed to import sales', not_found_product_codes: jsonStr.not_found_product_codes || [] };
    }

    const jsonStr = await response.json();
    return {
      success: true,
      message: jsonStr.message
    };
  } catch (error) {
    console.error('Error importing sales:', error);
    return { success: false, message: 'An unexpected error occurred while importing sales' };
  }
}

// TODO: Temporary disable these functions
/*
export async function getSaleById(id: string): Promise<{ success: boolean; data?: SalesType; message?: string }> {
  try {
    const response = await requestToService(`v1/sales/${id}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: "Sale not found"
        };
      }
      console.error('Failed to fetch sale');
      return { success: false, data: undefined, message: 'Failed to fetch sale' };
    }

    const jsonStr = await response.json();
    return jsonStr;
  } catch (error) {
    console.error("Error fetching sale:", error);
    return {
      success: false,
      message: "Failed to fetch sale"
    };
  }
}

export async function getSalesByDateRange(startDate: string, endDate: string): Promise<SalesResponse> {
  try {
    const response = await requestToService(`v1/sales/date-range?start_date=${startDate}&end_date=${endDate}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          success: false,
          data: [],
          message: jsonStr.message
        };
      }
      console.error('Failed to fetch sales by date range');
      return { success: false, data: [], message: 'Failed to fetch sales by date range' };
    }

    const jsonStr = await response.json();
    return jsonStr;
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    return { success: false, data: [], message: 'An unexpected error occurred while fetching sales by date range' };
  }
}

export async function getSalesByRecipeId(recipeId: string): Promise<SalesResponse> {
  try {
    const response = await requestToService(`v1/sales/recipe/${recipeId}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          success: false,
          data: [],
          message: jsonStr.message
        };
      }
      console.error('Failed to fetch sales by recipe');
      return { success: false, data: [], message: 'Failed to fetch sales by recipe' };
    }

    const jsonStr = await response.json();
    return jsonStr;
  } catch (error) {
    console.error('Error fetching sales by recipe:', error);
    return { success: false, data: [], message: 'An unexpected error occurred while fetching sales by recipe' };
  }
}

export async function createSale(sales: SalesType[]): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/sales`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sales),
    });

    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          success: false,
          message: "Sale not found"
        };
      }
      console.error('Failed to create sale');
      return { success: false, message: 'Failed to create sale' };
    }

    const jsonStr = await response.json();
    return jsonStr;
  } catch (error) {
    console.error("Error creating sales:", error);
    return {
      success: false,
      message: "Failed to create sales"
    };
  }
}
*/ 