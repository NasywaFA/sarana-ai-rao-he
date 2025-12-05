"use client";

import { useState } from "react";
import { RecipeType } from "@/types/RecipeType";
import { RecipeItemType } from "@/types/RecipeType";
import { createRecipeItem } from "@/services/recipeService";
import ItemCombobox from "@/components/ItemCombobox";
import toast from "react-hot-toast";

interface AddRecipeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeType | null;
  onSuccess?: () => void;
}

export default function AddRecipeItemModal({ isOpen, onClose, recipe, onSuccess }: AddRecipeItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      toast.error("Please select an item");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    try {
      const recipeItemData: Partial<RecipeItemType> = {
        recipe_id: recipe!.id!,
        item_id: selectedItemId,
        quantity: parseFloat(quantity),
      };

      const response = await createRecipeItem(recipeItemData);
      
      if (response.isSuccess) {
        toast.success(response.message || "Item added to recipe successfully");
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || "Failed to add item to recipe");
      }
    } catch (error) {
      console.error("Error adding recipe item:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedItemId("");
    setQuantity("");
    onClose();
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add Item to Recipe</h3>
            <p className="text-sm text-gray-600 mt-1">{recipe.name} ({recipe.code})</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Item Selection */}
            <ItemCombobox
              value={selectedItemId}
              onChange={setSelectedItemId}
              label="Item"
              placeholder="Search for an item..."
              required
            />

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="0.01"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !selectedItemId || !quantity}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
} 