"use client";

import { useState, useEffect } from "react";
import { RecipeType, RecipeItemType } from "@/types/RecipeType";
import { getRecipeItems, cookRecipe } from "@/services/recipeService";
import toast from "react-hot-toast";

interface CookRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeType | null;
}

export default function CookRecipeModal({ isOpen, onClose, recipe }: CookRecipeModalProps) {
  const [recipeItems, setRecipeItems] = useState<RecipeItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [cookLoading, setCookLoading] = useState(false);
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    if (isOpen && recipe) {
      loadRecipeItems();
      setAmount(1);
    }
    if (!isOpen) {
      setRecipeItems([]);
    }
  }, [isOpen, recipe]);

  const loadRecipeItems = async () => {
    if (!recipe) return;
    setLoading(true);
    try {
      const response = await getRecipeItems(recipe.id!);
      if (response.isSuccess) {
        setRecipeItems(response.data || []);
      } else {
        toast.error(response.message || "Failed to load recipe items");
      }
    } catch (error) {
      console.error("Error loading recipe items:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;
    if (!amount || amount < 1) {
      toast.error("Please enter a valid amount to cook");
      return;
    }
    setCookLoading(true);
    try {
      const response = await cookRecipe(recipe.id!, amount);
      if (response.isSuccess) {
        toast.success(response.message || "Recipe cooked successfully");
        onClose();
      } else {
        toast.error(response.message || "Failed to cook recipe");
      }
    } catch (error) {
      console.error("Error cooking recipe:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setCookLoading(false);
    }
  };

  const handleClose = () => {
    setAmount(1);
    onClose();
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cook Recipe</h3>
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
        <form onSubmit={handleCook} className="px-6 py-4">
          <div className="space-y-4">
            {/* Recipe Items Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading items...</span>
                </div>
              ) : recipeItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No items found for this recipe.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Item</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Quantity</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Stock</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipeItems.map((ri) => (
                      <tr key={ri.item_id}>
                        <td className="px-3 py-2 font-medium text-gray-900">{ri.item?.name || ri.item_id}</td>
                        <td className="px-3 py-2 text-gray-900">{ri.quantity}</td>
                        <td className="px-3 py-2 text-gray-900">{ri.item?.stock?.toLocaleString() ?? "-"} {ri.item?.unit || "-"}</td>
                        <td className="px-3 py-2 text-gray-900">{ri.quantity * amount} {ri.item?.unit || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Amount to Cook */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount to Cook *</label>
              <input
                id="amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={cookLoading}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 px-0 py-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={cookLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cookLoading || amount < 1 || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cookLoading ? "Cooking..." : "Cook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}