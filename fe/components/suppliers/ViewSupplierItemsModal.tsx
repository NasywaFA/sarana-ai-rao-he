"use client";

import { SupplierType, SupplierItemType, SupplierItemsPaginatedResponse } from "@/types/SupplierType";
import { ItemType } from "@/types/ItemType";
import { useEffect, useState } from "react";
import { getSupplierItems } from "@/services/supplierService";
import { getItems } from "@/services/itemService";
import AddSupplierItemModal from "./AddSupplierItemModal";
import EditSupplierItemModal from "./EditSupplierItemModal";
import DeleteSupplierItemModal from "./DeleteSupplierItemModal";
import toast from "react-hot-toast";

interface ViewSupplierItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierType | null;
}

export default function ViewSupplierItemsModal({ isOpen, onClose, supplier }: ViewSupplierItemsModalProps) {
  const [supplierItems, setSupplierItems] = useState<SupplierItemType[]>([]);
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplierItem, setSelectedSupplierItem] = useState<SupplierItemType | null>(null);

  useEffect(() => {
    if (isOpen && supplier) {
      loadSupplierItems();
      loadItems();
    }
  }, [isOpen, supplier, page, search]);

  const loadSupplierItems = async () => {
    if (!supplier) return;
    
    setLoading(true);
    try {
      const response: SupplierItemsPaginatedResponse = await getSupplierItems(supplier.id, page, limit, search);
      if (response.isSuccess) {
        setSupplierItems(response.data || []);
        setTotal(response.total || 0);
      } else {
        toast.error(response.message || "Failed to load supplier items");
      }
    } catch (error) {
      console.error("Error loading supplier items:", error);
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
    loadSupplierItems();
  };

  const handleEditSuccess = () => {
    loadSupplierItems();
  };

  const handleDeleteSuccess = () => {
    loadSupplierItems();
  };

  const getItemDetails = (itemId: string): ItemType | undefined => {
    return items.find(item => item.id === itemId);
  };

  const handleEdit = (supplierItem: SupplierItemType) => {
    setSelectedSupplierItem(supplierItem);
    setShowEditModal(true);
  };

  const handleDelete = (supplierItem: SupplierItemType) => {
    setSelectedSupplierItem(supplierItem);
    setShowDeleteModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (!isOpen || !supplier) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Supplier Items</h3>
              <p className="text-sm text-gray-600 mt-1">{supplier.name}</p>
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
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex space-x-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
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
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading supplier items...</p>
              </div>
            ) : supplierItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search ? "No items match your search criteria." : "This supplier doesn't have any items."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplierItems.map((supplierItem) => {
                      const itemDetails = getItemDetails(supplierItem.item_id);
                      return (
                        <tr key={`${supplierItem.supplier_id}-${supplierItem.item_id}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {itemDetails?.code || supplierItem.item_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {itemDetails?.name || "Unknown Item"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {itemDetails?.unit || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {supplierItem.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {supplierItem.moq || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(supplierItem)}
                              className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(supplierItem)}
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
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add Supplier Item Modal */}
      <AddSupplierItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        supplier={supplier}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Supplier Item Modal */}
      <EditSupplierItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        supplier={supplier}
        supplierItem={selectedSupplierItem}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Supplier Item Modal */}
      <DeleteSupplierItemModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        supplier={supplier}
        supplierItem={selectedSupplierItem}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
} 