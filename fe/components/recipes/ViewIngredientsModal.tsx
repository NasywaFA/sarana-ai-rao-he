"use client";

import { useState, useEffect } from "react";
import { RecipeType, RecipeItemType } from "@/types/RecipeType";
import { ItemType } from "@/types/ItemType";
import { getRecipeItems } from "@/services/recipeService";
import { getItems } from "@/services/itemService";
import AddRecipeItemModal from "./AddRecipeItemModal";
import EditRecipeItemModal from "./EditRecipeItemModal";
import DeleteRecipeItemModal from "./DeleteRecipeItemModal";
import toast from "react-hot-toast";

interface ViewIngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeType | null;
}

export default function ViewIngredientsModal({
  isOpen,
  onClose,
  recipe,
}: ViewIngredientsModalProps) {
  const [recipeItems, setRecipeItems] = useState<RecipeItemType[]>([]);
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<RecipeItemType | null>(null);

  useEffect(() => {
    if (isOpen && recipe) {
      loadRecipeItems();
      loadItems();
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

  const loadItems = async () => {
    try {
      const response = await getItems(1, 1000);
      if (response.isSuccess) {
        setItems(response.data || []);
      }
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const handleAddSuccess = () => {
    loadRecipeItems();
  };

  const handleEditSuccess = () => {
    loadRecipeItems();
  };

  const handleDeleteSuccess = () => {
    loadRecipeItems();
  };

  const getItemDetails = (itemId: string): ItemType | undefined => {
    return items.find(item => item.id === itemId);
  };

  const handleEdit = (recipeItem: RecipeItemType) => {
    setSelectedRecipeItem(recipeItem);
    setShowEditModal(true);
  };

  const handleDelete = (recipeItem: RecipeItemType) => {
    setSelectedRecipeItem(recipeItem);
    setShowDeleteModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll filter client-side since the API doesn't support search
    // In the future, this could be updated to use server-side search
  };

  const filteredRecipeItems = recipeItems.filter(recipeItem => {
    if (!search) return true;
    const itemDetails = getItemDetails(recipeItem.item_id);
    if (!itemDetails) return false;
    
    return (
      itemDetails.code.toLowerCase().includes(search.toLowerCase()) ||
      itemDetails.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const formatType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTypeBadge = (type: string) => {
    const badgeClasses = {
      inventory_purchased: "bg-blue-100 text-blue-800",
      inventory_produced: "bg-green-100 text-green-800",
      raw_material: "bg-gray-100 text-gray-800",
    };

    return (
      badgeClasses[type as keyof typeof badgeClasses] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (!isOpen || !recipe) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Recipe Ingredients
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {recipe.name} ({recipe.code})
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                >
                  Add Item
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 sm:p-2 transition-colors"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex space-x-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ingredients..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">
                  Loading ingredients...
                </span>
              </div>
            ) : filteredRecipeItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">
                  No ingredients found
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {search ? "No ingredients match your search criteria." : "This recipe doesn't have any ingredients."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {filteredRecipeItems.length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total Ingredients
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {filteredRecipeItems.filter((item) => {
                          const itemDetails = getItemDetails(item.item_id);
                          return itemDetails && itemDetails.stock > 0;
                        }).length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Available
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {filteredRecipeItems.filter((item) => {
                          const itemDetails = getItemDetails(item.item_id);
                          return itemDetails && itemDetails.stock === 0;
                        }).length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Out of Stock
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredients Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Code
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecipeItems.map((recipeItem) => {
                        const itemDetails = getItemDetails(recipeItem.item_id);
                        const isAvailable = itemDetails && itemDetails.stock > 0;
                        
                        return (
                          <tr key={`${recipeItem.recipe_id}-${recipeItem.item_id}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {itemDetails?.code || recipeItem.item_id}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                              {itemDetails?.name || "Unknown Item"}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(itemDetails?.type || '')}`}>
                                {formatType(itemDetails?.type || 'unknown')}
                              </span>
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                              {recipeItem.quantity}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                              {itemDetails?.unit || "-"}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                              {itemDetails?.stock.toLocaleString() || "0"}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isAvailable 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {isAvailable ? "Available" : "Out of Stock"}
                              </span>
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleEdit(recipeItem)}
                                className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(recipeItem)}
                                className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg p-1 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add Recipe Item Modal */}
      <AddRecipeItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        recipe={recipe}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Recipe Item Modal */}
      <EditRecipeItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        recipe={recipe}
        recipeItem={selectedRecipeItem}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Recipe Item Modal */}
      <DeleteRecipeItemModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        recipe={recipe}
        recipeItem={selectedRecipeItem}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
