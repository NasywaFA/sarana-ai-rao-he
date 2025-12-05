"use server";
import { requestToService } from "@/helpers/request";
import {
  RecipeType,
  RecipesResponse,
  RecipeIngredientsResponse,
  RecipeItemType,
  RecipeItemsResponse,
  RecipeItemResponse,
} from "../types/RecipeType";
import { getCurrentBranch, getCurrentBranchWithDetails } from "./branchesService";

export async function getRecipes(
  page: number = 1,
  limit: number = 10,
  branchId: string = ""
): Promise<RecipesResponse> {
  try {
    const response = await requestToService(
      `v1/recipes?page=${page}&limit=${limit}${branchId ? `&branch_id=${branchId}` : ""}`,
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

      console.error("Failed to fetch recipes");
      return { isSuccess: false, data: [], message: "Failed to fetch recipes" };
    }

    const json = await response.json();
    return {
      isSuccess: true,
      data: json.results,
      message: "Recipes retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return {
      isSuccess: false,
      data: [],
      message: "An unexpected error occurred while fetching recipes",
    };
  }
}

export async function getRecipe(recipeId: string): Promise<{ isSuccess: boolean; data?: RecipeType; message?: string }> {
  try {
    const response = await requestToService(`v1/recipes/${recipeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, data: json.data || json.recipe, message: json.message };
  } catch (error) {
    return { isSuccess: false, message: "Failed to fetch recipe" };
  }
}

export async function importRecipes(
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  try {
    // Get current branch
    const branchId = await getCurrentBranch();
    if (!branchId.isSuccess) {
      return {
        success: false,
        message: "Failed to get current branch"
      }
    }

    const response = await requestToService(`v1/recipes/import-csv?branch_id=${branchId.data}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to import recipes", response.status);

      const jsonStr = await response.json();
      return { success: false, message: jsonStr.message || "Failed to import recipes" };
    }

    const jsonStr = await response.json();
    return {
      success: true,
      message: jsonStr.message,
    };
  } catch (error) {
    console.error("Error importing recipes:", error);
    return {
      success: false,
      message: "An unexpected error occurred while importing recipes",
    };
  }
}

export async function createRecipe(
  recipe: RecipeType
): Promise<{ success: boolean; message?: string }> {
  try {
    // Get current branch
    const branch = await getCurrentBranchWithDetails();
    if (!branch.isSuccess) {
      return {
        success: false,
        message: 'Failed to get current branch'
      }
    }
    recipe.branch_id = branch.data!.id;

    const response = await requestToService(`v1/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipe),
    });

    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          success: false,
          message: "Recipe not found",
        };
      }
      console.error("Failed to create recipe");
      return { success: false, message: "Failed to create recipe" };
    }

    const jsonStr = await response.json();
    return {
      success: true,
      message: jsonStr.message || "Item created successfully",
    };
  } catch (error) {
    console.error("Error creating recipes:", error);
    return {
      success: false,
      message: "Failed to create recipes",
    };
  }
}

export async function updateRecipe(
  id: string,
  updatedRecipe: Partial<RecipeType>
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log("Barang barangnya: ", JSON.stringify(updatedRecipe));
    const response = await requestToService(`v1/recipes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRecipe),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Update error:", errorData);
      return {
        success: false,
        message:
          errorData.message || `Update failed with status ${response.status}`,
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: responseData.message || "Recipe updated successfully",
    };
  } catch (error) {
    console.error("Error updating recipe:", error);
    return {
      success: false,
      message: "Network error occurred while updating recipe",
    };
  }
}

export async function deleteRecipe(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/recipes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Delete error:", errorData);
      return {
        success: false,
        message:
          errorData.message || `Delete failed with status ${response.status}`,
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: responseData.message || "Recipe deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return {
      success: false,
      message: "Network error occurred while deleting recipe",
    };
  }
}

// TODO: Temporary disable these functions
/*
export async function getRecipeByCode(code: string): Promise<{ success: boolean; data?: RecipeType; message?: string }> {
  try {
    const response = await requestToService(`v1/recipes/${code}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: "Recipe not found"
        };
      }
      console.error('Failed to fetch recipe');
      return { success: false, data: undefined, message: 'Failed to fetch recipe' };
    }

    const jsonStr = await response.json();
    return jsonStr;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return {
      success: false,
      message: "Failed to fetch recipe"
    };
  }
}




*/

export async function getRecipeIngredients(recipeCode: string): Promise<{
  success: boolean;
  data?: RecipeIngredientsResponse;
  message?: string;
}> {
  try {
    const response = await requestToService(
      `v1/recipes/${recipeCode}/ingredients`,
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
          success: false,
          message: jsonStr.message || "Recipe ingredients not found",
        };
      }
      console.error("Failed to fetch recipe ingredients");
      return { success: false, message: "Failed to fetch recipe ingredients" };
    }

    const jsonStr = await response.json();
    return {
      success: true,
      data: jsonStr,
      message: "Recipe ingredients retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching recipe ingredients:", error);
    return {
      success: false,
      message: "An unexpected error occurred while fetching recipe ingredients",
    };
  }
}

// --- RECIPE ITEM CRUD ---
export async function getRecipeItems(recipeId: string): Promise<RecipeItemsResponse> {
  try {
    const response = await requestToService(`v1/recipes/${recipeId}/items`, {
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
      data: json.data || json.recipe_items || [],
      message: json.message || "Recipe items retrieved successfully"
    };
  } catch (error) {
    console.error('[RECIPE SERVICE] Error fetching recipe items:', error);
    return { isSuccess: false, data: [], message: 'An unexpected error occurred while fetching recipe items' };
  }
}

export async function createRecipeItem(data: Partial<RecipeItemType>): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/recipes/items`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Recipe item created successfully" };
  } catch (error) {
    console.error('[RECIPE SERVICE] Error creating recipe item:', error);
    return { isSuccess: false, message: "Failed to create recipe item" };
  }
}

export async function updateRecipeItem(recipeId: string, itemId: string, data: Partial<RecipeItemType>): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/recipes/${recipeId}/items/${itemId}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Recipe item updated successfully" };
  } catch (error) {
    console.error('[RECIPE SERVICE] Error updating recipe item:', error);
    return { isSuccess: false, message: "Failed to update recipe item" };
  }
}

export async function deleteRecipeItem(recipeId: string, itemId: string): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/recipes/${recipeId}/items/${itemId}`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Recipe item deleted successfully" };
  } catch (error) {
    console.error('[RECIPE SERVICE] Error deleting recipe item:', error);
    return { isSuccess: false, message: "Failed to delete recipe item" };
  }
}

export async function cookRecipe(recipeId: string, amount: number = 1): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const response = await requestToService(`v1/recipes/${recipeId}/cook?amount=${amount}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const json = await response.json();
      return { isSuccess: false, message: json.message };
    }
    const json = await response.json();
    return { isSuccess: true, message: json.message || "Recipe cooked successfully" };
  } catch (error) {
    console.error('[RECIPE SERVICE] Error cooking recipe:', error);
    return { isSuccess: false, message: "Failed to cook recipe" };
  }
}