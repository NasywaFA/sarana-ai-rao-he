"use client";

import { useState } from "react";
import { SupplierType } from "@/types/SupplierType";
import { SupplierItemType } from "@/types/SupplierType";
import { deleteSupplierItem } from "@/services/supplierService";
import toast from "react-hot-toast";

interface DeleteSupplierItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierType | null;
  supplierItem: SupplierItemType | null;
  onSuccess?: () => void;
}

export default function DeleteSupplierItemModal({ isOpen, onClose, supplier, supplierItem, onSuccess }: DeleteSupplierItemModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!supplier || !supplierItem) return;

    setLoading(true);
    try {
      const response = await deleteSupplierItem(supplier.id, supplierItem.item_id);
      
      if (response.isSuccess) {
        toast.success(response.message || "Supplier item deleted successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to delete supplier item");
      }
    } catch (error) {
      console.error("Error deleting supplier item:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !supplier || !supplierItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Supplier Item</h3>
            <p className="text-sm text-gray-600 mt-1">{supplier.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Are you sure?</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>
                  This action will remove the item <strong>ID: {supplierItem.item_id}</strong> from supplier <strong>{supplier.name}</strong>.
                </p>
                <p className="mt-2">This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
} 