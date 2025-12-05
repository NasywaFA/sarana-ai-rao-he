"use client";

import { useState, useEffect } from "react";
import { ItemTypeWithQuantityAndNotEnoughItems } from "@/types/ItemType";
import { SupplierType } from "@/types/SupplierType";
import SupplierCombobox from "./SupplierCombobox";
import { X, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CallSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  insufficientItems: ItemTypeWithQuantityAndNotEnoughItems[];
  recipeName: string;
  recipeCode: string;
  date: string;
}

interface SelectedSupplier {
  itemId: string;
  supplier: SupplierType | null;
}

export default function CallSupplierDialog({
  isOpen,
  onClose,
  insufficientItems,
  recipeName,
  recipeCode,
  date
}: CallSupplierDialogProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<SelectedSupplier[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to collect all items recursively
  const collectAllItems = (items: ItemTypeWithQuantityAndNotEnoughItems[]): ItemTypeWithQuantityAndNotEnoughItems[] => {
    const allItems: ItemTypeWithQuantityAndNotEnoughItems[] = [];
    
    const traverse = (itemList: ItemTypeWithQuantityAndNotEnoughItems[]) => {
      itemList.forEach(item => {
        allItems.push(item);
        if (item.not_enough_items && item.not_enough_items.length > 0) {
          traverse(item.not_enough_items);
        }
      });
    };
    
    traverse(items);
    return allItems;
  };

  // Initialize selected suppliers when dialog opens
  useEffect(() => {
    if (isOpen && insufficientItems.length > 0) {
      const allItems = collectAllItems(insufficientItems);
      const initialSuppliers = allItems
        .filter(item => item.type === 'inventory_purchased' && item.id) // Only inventory_purchased items with valid IDs
        .map(item => ({
          itemId: item.id!,
          supplier: null
        })) as SelectedSupplier[];
      setSelectedSuppliers(initialSuppliers);
    }
  }, [isOpen, insufficientItems]);

  const handleSupplierSelect = (itemId: string, supplier: SupplierType | null) => {
    setSelectedSuppliers(prev => {
      return prev.map(item =>
        item.itemId === itemId
          ? { ...item, supplier }
          : item
      );
    });
  };

  const handleContactSupplier = (supplier: SupplierType, item: ItemTypeWithQuantityAndNotEnoughItems) => {
    const shortage = item.quantity - item.stock;
    const neededQuantity = shortage > 0 ? shortage : 0;
    
    // Create WhatsApp message in Bahasa Indonesia
    const message = `Halo ${supplier.name}, kami dari Rao He Restaurant. Apakah item *${item.name}* ini tersedia? Mohon informasi ketersediaan dan harga. Terima kasih!`;

    const whatsappUrl = `https://wa.me/${supplier.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    toast.success(`Opening WhatsApp chat with ${supplier.name} for ${item.name}`);
  };

  const renderNotEnoughItems = (notEnoughItems: ItemTypeWithQuantityAndNotEnoughItems[], nestLevelParam: number = 0) => {
    return notEnoughItems.map((item, index) => {
      const itemId = item.id;
      const selectedSupplier = itemId ? selectedSuppliers.find(s => s.itemId === itemId)?.supplier : null;

      const notEnoughIngredients = item.not_enough_items;
      const nextNestLevel = nestLevelParam + 1;
      const shortage = item.quantity - item.stock;

      return (
        <div key={item.id} className={`border border-gray-200 ${item.type === `inventory_purchased` ? shortage < 0 ? `bg-green-50` : `bg-yellow-50` : ``} rounded-lg p-4`} style={{
          marginLeft: `${nestLevelParam * 10}px`
        }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <p className="text-sm text-gray-600">
                {item.code} • Need: {item.quantity} {item.unit} • Available: {item.stock} {item.unit}
              </p>
              {shortage > 0 ? (
                <p className="text-sm text-red-600 font-medium">
                  Shortage: {shortage} {item.unit}
                </p>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  {shortage === 0 ? "Sufficient stock" : `Surplus: ${Math.abs(shortage)} ${item.unit}`}
                </p>
              )}
            </div>
          </div>

          {[`half_finished`, `finished`].includes(item.type) && notEnoughIngredients.length > 0 && (
            <div className="mt-4 space-y-4">
              <h5 className="text-sm font-medium text-gray-700">Required Ingredients:</h5>
              {renderNotEnoughItems(notEnoughIngredients, nextNestLevel)}
            </div>
          )}

          {item.type === `inventory_purchased` && itemId && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Supplier
              </label>

              <SupplierCombobox
                itemId={itemId}
                value={selectedSupplier?.id || ""}
                onChange={(supplierId: string) => {
                  // This will be handled by the combobox component
                }}
                onSupplierSelect={(supplier: SupplierType | null) => handleSupplierSelect(itemId, supplier)}
                placeholder={`Search suppliers for ${item.name}...`}
              />

              {selectedSupplier && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{selectedSupplier.name}</h5>
                      <p className="text-sm text-gray-600">{selectedSupplier.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContactSupplier(selectedSupplier, item)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Suppliers</h2>
            <p className="text-sm text-gray-600 mt-1">
              {recipeName} ({recipeCode}) - {new Date(date).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Insufficient Ingredients ({insufficientItems.length})
            </h3>

            <div className="space-y-6">
              {renderNotEnoughItems(insufficientItems)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
