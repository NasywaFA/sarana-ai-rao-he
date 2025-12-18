"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  createItem,
  deleteItem,
  getItems,
  importItems,
  updateItem,
} from "@/services/itemService";
import { ItemType } from "@/types/ItemType";
import ItemsTable from "@/components/items/ItemsTable";
import ItemTransactionsTable from "@/components/items/ItemTransactionsTable";
import ImportItemsModal from "@/components/ImportModal";
import UrgentStockRecommendations from "@/components/items/UrgentStockRecommendations";
import FormModal from "@/components/CreateModal";
import { FormField } from "@/types/FormField";
import FormModalEdit from "@/components/EditModal";
import { AlertModal } from "@/components/confirmDelete";
import { getBranchData } from "@/helpers/misc";
import ViewLogsModal from "@/components/items/ViewLogsModal";
import TransferModal from "@/components/items/TransferModal";
import { getCurrentBranch, getCurrentBranchWithDetails } from "@/services/branchesService";

export default function ItemsPage() {
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewLogsModalOpen, setViewLogsModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemType | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const itemFormFields: FormField[] = useMemo(
    () => [
      {
        name: "code",
        label: "Item Code",
        type: "text",
        required: true,
      },
      {
        name: "name",
        label: "Item Name",
        type: "text",
        required: true,
      },
      {
        name: "type",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "inventory_purchased", label: "Inventory Purchased" },
          { value: "half_finished", label: "Half Finished" },
          { value: "finished", label: "Finished" },
        ],
      },
      {
        name: "stock",
        label: "Initial Stock",
        type: "number",
        required: true,
        defaultValue: "1",
      },
      {
        name: "unit",
        label: "Unit",
        type: "text",
        required: true,
        defaultValue: "pcs",
      },
      // {
      //   name: "lead_time",
      //   label: "Lead Time (Hours)",
      //   type: "number",
      //   required: true,
      //   defaultValue: "0",
      // },
    ],
    []
  );

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const branchResp = await getCurrentBranch();
      if (!branchResp.isSuccess || !branchResp.data) {
        toast.error("Branch not found");
        return;
      }

      const branchId = branchResp.data;

      const response = await getItems(1, 1000, branchId);
      if (response.isSuccess) {
        setItems(response.data);
      } else {
        toast.error(response.message || "Failed to load items");
      }
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleImportItems = async (importedItems: File) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("file", importedItems);
      const response = await importItems(formData);

      if (response.isSuccess) {
        await loadItems();
        setImportModalOpen(false);
        toast.success(response.message || "Import items successfully", {
          duration: 4000,
          style: {
            fontWeight: "600",
          },
        });
      } else {
        toast.error(response.message || "Failed to import items");
      }
    } catch (error) {
      console.error("Error importing items:", error);
      toast.error("Failed to import items");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateItem = async (formData: Record<string, any>) => {
    try {
      setActionLoading(true);

      const newItem: ItemType = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        stock: Number(formData.stock),
        unit: formData.unit,
        // lead_time: Number(formData.lead_time),
        lead_time: 1, // hardcode 1 hour temporary
      };

      const response = await createItem(newItem);

      if (response.isSuccess) {
        await loadItems();
        setCreateModalOpen(false);
        toast.success("Item created successfully", {
          duration: 4000,
          style: {
            fontWeight: "600",
          },
        });
      } else {
        toast.error(response.message || "Failed to create item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveItem = async (updatedItemData: Record<string, any>) => {
    try {items
      setActionLoading(true);

      if (!selectedItem) return;

      const updatedItem: ItemType = {
        ...selectedItem,
        code: updatedItemData.code,
        name: updatedItemData.name,
        type: updatedItemData.type,
        stock: Number(updatedItemData.stock),
        unit: updatedItemData.unit,
        // lead_time: Number(updatedItemData.lead_time),
        lead_time: 1, // hardcode 1 hour temporary
      };

      const response = await updateItem(selectedItem.id || "", updatedItem);

      if (response.isSuccess) {
        await loadItems();
        setEditModalOpen(false);
        setSelectedItem(null);
        toast.success("Item updated successfully");
      } else {
        toast.error(response.message || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setActionLoading(true);
      const response = await deleteItem(itemToDelete.id || "");

      if (response.isSuccess) {
        await loadItems();
        setDeleteModalOpen(false);
        setItemToDelete(null);
        toast.success("Item deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Items Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your inventory items, stock levels, and categories
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 sm:gap-4">
          <div className="bg-white rounded-lg px-3 py-1 sm:px-4 sm:py-2 border border-blue-200">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {items.length}
            </div>
            <div className="text-xs text-gray-500">Total Items</div>
          </div>
        </div>
      </div>

      {/* AI Urgent Stock Recommendations */}
      <UrgentStockRecommendations items={items} loading={loading} />

      {/* Items Table */}
      <div className="overflow-x-auto">
        <ItemsTable
          items={items}
          loading={loading}
          onImport={() => setImportModalOpen(true)}
          onCreate={() => setCreateModalOpen(true)}
          onViewLogs={(item) => {
            setSelectedItem(item);
            setViewLogsModalOpen(true);
          }}
          onEdit={(item) => {
            setSelectedItem(item);
            setEditModalOpen(true);
          }}
          onDelete={(item) => {
            setItemToDelete(item);
            setDeleteModalOpen(true);
          }}
          onTransfer={(item) => {
            setSelectedItem(item);
            setTransferModalOpen(true);
          }}
        />
      </div>

      {/* Item Transactions Table */}
      <ItemTransactionsTable loading={loading} />

      {/* Create Item Modal */}
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateItem}
        loading={actionLoading}
        title="Create New Item"
        fields={itemFormFields}
      />

      {/* Edit Item Modal */}
      <FormModalEdit
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleSaveItem}
        loading={actionLoading}
        title="Edit Item"
        fields={itemFormFields}
        initialData={selectedItem || {}}
      />

      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteItem}
        title="Konfirmasi Hapus"
        description={`Apakah Anda yakin ingin menghapus "${itemToDelete?.name}" (${itemToDelete?.code})? Aksi ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        loading={actionLoading}
        variant="destructive"
      />

      {/* Import Items Modal */}
      <ImportItemsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportItems}
        loading={actionLoading}
      />

      {/* View Logs Modal */}
      <ViewLogsModal
        isOpen={viewLogsModalOpen}
        onClose={() => {
          setViewLogsModalOpen(false);
          loadItems();
        }}
        item={selectedItem || {} as ItemType}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        item={selectedItem || {} as ItemType}
      />
    </div>
  );
}
