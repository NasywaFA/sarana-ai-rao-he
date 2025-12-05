"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  createRecipe,
  deleteRecipe,
  getRecipes,
  importRecipes,
  updateRecipe,
} from "@/services/recipeService";
import { RecipeType } from "@/types/RecipeType";
import RecipesTable from "@/components/recipes/RecipesTable";
import ImportItemsModal from "@/components/ImportModal";
import ViewIngredientsModal from "@/components/recipes/ViewIngredientsModal";
import MenuStockRecommendations from "@/components/recipes/MenuStockRecommendations";
import FormModal from "@/components/CreateModal";
import { FormField } from "@/types/FormField";
import FormModalEdit from "@/components/EditModal";
import { AlertModal } from "@/components/confirmDelete";
import { getBranchData } from "@/helpers/misc";
import CookRecipeModal from "@/components/recipes/CookRecipeModal";

export default function MenuPage() {
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeType | null>(null);
  const [viewIngredientsModalOpen, setViewIngredientsModalOpen] =
    useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cookRecipeModalOpen, setCookRecipeModalOpen] = useState(false);

  const recipeFormFields: FormField[] = useMemo(
    () => [
      {
        name: "code",
        label: "Recipe Code",
        type: "text",
        required: true,
      },
      {
        name: "name",
        label: "Recipe Name",
        type: "text",
        required: true,
      },
      {
        name: "type",
        label: "Recipe Type",
        type: "select",
        required: true,
        options: [
          { value: "half_finished", label: "Half Finished" },
          { value: "finished", label: "Finished" },
        ],
      },
    ],
    []
  );

  // Load menus on component mount
  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const branch = await getBranchData();
      if (!branch) {
        toast.error("Branch not found");
        return;
      }
      const response = await getRecipes(1, 1000, branch.id);

      if (response.isSuccess) {
        setRecipes(response.data);
      } else {
        toast.error(response.message || "Failed to load menus");
      }
    } catch (error) {
      console.error("Error loading menus:", error);
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = (recipe: RecipeType) => {
    setSelectedRecipe(recipe);
    setEditModalOpen(true);
  };

  const handleViewIngredients = (recipe: RecipeType) => {
    setSelectedRecipe(recipe);
    setViewIngredientsModalOpen(true);
  };

  const handleImportRecipes = async (importedRecipes: File) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("file", importedRecipes);
      const response = await importRecipes(formData);

      if (response.success) {
        await loadMenus();
        setImportModalOpen(false);
        toast.success(response.message || "Import recipes successfully", {
          duration: 4000,
          style: {
            fontWeight: "600",
          },
        });
      } else {
        toast.error(response.message || "Failed to import menus");
      }
    } catch (error) {
      console.error("Error importing menus:", error);
      toast.error("Failed to import menus");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRecipe = async (formData: Record<string, any>) => {
    try {
      setActionLoading(true);

      const newRecipe: RecipeType = {
        code: formData.code,
        branch_id: formData.branch_id,
        name: formData.name,
        type: formData.type,
      };

      const response = await createRecipe(newRecipe);

      if (response.success) {
        await loadMenus();
        setCreateModalOpen(false);
        toast.success("Item created successfully", {
          duration: 4000,
          style: {
            fontWeight: "600",
          },
        });
      } else {
        toast.error(response.message || "Failed to create recipe");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast.error("Failed to create recipe");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRecipe = async (formData: Record<string, any>) => {
    try {
      setActionLoading(true);

      if (!selectedRecipe) return;

      const updatedRecipe: RecipeType = {
        ...selectedRecipe,
        code: formData.code,
        name: formData.name,
        type: formData.type,
      };

      const response = await updateRecipe(selectedRecipe.id!, updatedRecipe);

      if (response.success) {
        await loadMenus();
        setEditModalOpen(false);
        setSelectedRecipe(null);
        toast.success(response.message || "Recipe updated successfully");
      } else {
        toast.error(response.message || "Failed to update recipe");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("Failed to update recipe");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipeToDelete) return;

    try {
      setActionLoading(true);
      const response = await deleteRecipe(recipeToDelete.id!);

      if (response.success) {
        await loadMenus();
        setDeleteModalOpen(false);
        setRecipeToDelete(null);
        toast.success(response.message || "Recipe deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCookRecipe = (recipe: RecipeType) => {
    setSelectedRecipe(recipe);
    setCookRecipeModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your menu items, recipes, and ingredient compositions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:space-x-4 mt-2 sm:mt-0">
          <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 text-center sm:text-left">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {recipes.length}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 border border-yellow-200 text-center sm:text-left">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">
              {
                recipes.filter((recipe) => recipe.type === "half_finished")
                  .length
              }
            </div>
            <div className="text-xs text-gray-500">Half</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 border border-green-200 text-center sm:text-left">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {recipes.filter((recipe) => recipe.type === "finished").length}
            </div>
            <div className="text-xs text-gray-500">Finished</div>
          </div>
        </div>
      </div>

      {/* AI Menu Stock Recommendations */}
      {/* <MenuStockRecommendations recipes={recipes} loading={loading} /> */}

      {/* Menus Table */}
      <div className="overflow-x-auto">
        <RecipesTable
          recipes={recipes}
          loading={loading}
          onEdit={handleEditRecipe}
          onImport={() => setImportModalOpen(true)}
          onCreate={() => setCreateModalOpen(true)}
          onViewIngredients={handleViewIngredients}
          onCook={handleCookRecipe}
          onDelete={(recipe) => {
            setRecipeToDelete(recipe);
            setDeleteModalOpen(true);
          }}
        />
      </div>

      {/* Cook recipe modal */}
      <CookRecipeModal
        isOpen={cookRecipeModalOpen}
        onClose={() => setCookRecipeModalOpen(false)}
        recipe={selectedRecipe}
      />

      {/* Create Recipe Modal */}
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateRecipe}
        loading={actionLoading}
        title="Create New Recipe"
        fields={recipeFormFields}
      />

      {/* Edit Recipe Modal */}
      <FormModalEdit
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRecipe(null);
        }}
        onSubmit={handleSaveRecipe}
        loading={actionLoading}
        title="Edit Recipe"
        fields={recipeFormFields}
        initialData={selectedRecipe || {}}
      />

      {/* Import Menus Modal */}
      <ImportItemsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportRecipes}
        loading={actionLoading}
      />

      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRecipeToDelete(null);
        }}
        onConfirm={handleDeleteRecipe}
        title="Konfirmasi Hapus"
        description={`Apakah Anda yakin ingin menghapus "${recipeToDelete?.name}" (${recipeToDelete?.code})? Aksi ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        loading={actionLoading}
        variant="destructive"
      />

      {/* View Ingredients Modal */}
      <ViewIngredientsModal
        isOpen={viewIngredientsModalOpen}
        onClose={() => {
          setViewIngredientsModalOpen(false);
          setSelectedRecipe(null);
        }}
        recipe={selectedRecipe}
      />
    </div>
  );
}
