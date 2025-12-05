"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { SupplierType } from "@/types/SupplierType";
import { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} from "@/services/supplierService";
import { usePagination } from "@/helpers/usePagination";
import Pagination from "@/components/Pagination";
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "lucide-react";
import AddSupplierModal from "@/components/suppliers/AddSupplierModal";
import EditSupplierModal from "@/components/suppliers/EditSupplierModal";
import DeleteSupplierModal from "@/components/suppliers/DeleteSupplierModal";
import ViewSupplierItemsModal from "@/components/suppliers/ViewSupplierItemsModal";

export default function SupplierDashboard() {
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType | null>(null);
  const [showViewItemsModal, setShowViewItemsModal] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSuppliers(1, 100); // Get all suppliers for client-side pagination
      if (response.isSuccess) {
        setSuppliers(response.data);
      } else {
        setError(response.message || "Failed to load suppliers");
        toast.error(response.message || "Failed to load suppliers");
      }
    } catch (err) {
      setError("Failed to load suppliers");
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = (supplier: SupplierType) => {
    if (searchTerm) {
      return (
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.whatsapp_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  };

  const pagination = usePagination({
    data: suppliers,
    filterFn: filterSuppliers,
    dependencies: [searchTerm],
  });

  const handleAddSupplier = async (supplierData: Omit<SupplierType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await createSupplier(supplierData);
      if (response.isSuccess) {
        toast.success("Supplier created successfully");
        setShowAddModal(false);
        loadSuppliers();
      } else {
        toast.error(response.message || "Failed to create supplier");
      }
    } catch (err) {
      toast.error("Failed to create supplier");
    }
  };

  const handleEditSupplier = async (id: string, supplierData: Partial<SupplierType>) => {
    try {
      const response = await updateSupplier(id, supplierData);
      if (response.isSuccess) {
        toast.success("Supplier updated successfully");
        setShowEditModal(false);
        setSelectedSupplier(null);
        loadSuppliers();
      } else {
        toast.error(response.message || "Failed to update supplier");
      }
    } catch (err) {
      toast.error("Failed to update supplier");
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      const response = await deleteSupplier(id);
      if (response.isSuccess) {
        toast.success("Supplier deleted successfully");
        setShowDeleteModal(false);
        setSelectedSupplier(null);
        loadSuppliers();
      } else {
        toast.error(response.message || "Failed to delete supplier");
      }
    } catch (err) {
      toast.error("Failed to delete supplier");
    }
  };

  const handleEdit = (supplier: SupplierType) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleDelete = (supplier: SupplierType) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const handleViewItems = (supplier: SupplierType) => {
    setSelectedSupplier(supplier);
    setShowViewItemsModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Suppliers Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your supplier relationships and contact information
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 sm:gap-4">
          <div className="bg-white rounded-lg px-3 py-1 sm:px-4 sm:py-2 border border-blue-200">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {suppliers.length}
            </div>
            <div className="text-xs text-gray-500">Total Suppliers</div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg border shadow-sm border-gray-200">
        {/* Table Header */}
        <div className="px-4 py-4 sm:px-6 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Suppliers</h2>
              <p className="text-sm text-gray-600">Manage your supplier relationships</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                <PlusIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">Add Supplier</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 sm:mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {error ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-red-500 sm:px-6">
                      {error}
                    </td>
                  </tr>
                ) : pagination.currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 sm:px-6">
                      {searchTerm ? "No suppliers found matching your search." : "No suppliers found."}
                    </td>
                  </tr>
                ) : (
                  pagination.currentItems.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.address}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <div>
                          <div className="text-sm text-gray-900">Phone: {supplier.phone_number}</div>
                          <div className="text-sm text-gray-500">WhatsApp: {supplier.whatsapp_number}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <button
                          onClick={() => handleViewItems(supplier)}
                          className="inline-flex items-center text-blue-600 cursor-pointer hover:text-blue-900 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Items
                        </button>
                      </td>
                      <td className="px-4 flex justify-end gap-2 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="inline-flex items-center text-blue-600 cursor-pointer hover:text-blue-900 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
                          className="inline-flex items-center text-red-600 cursor-pointer hover:text-red-900 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={pagination.setItemsPerPage}
            totalItems={suppliers.length}
            filteredItems={pagination.filteredItems.length}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            itemLabel="supplier"
            itemLabelPlural="suppliers"
          />
        )}
      </div>

             {/* Modals */}
       <AddSupplierModal
         isOpen={showAddModal}
         onClose={() => setShowAddModal(false)}
         onSubmit={handleAddSupplier}
       />

       <EditSupplierModal
         isOpen={showEditModal}
         onClose={() => {
           setShowEditModal(false);
           setSelectedSupplier(null);
         }}
         supplier={selectedSupplier}
         onSubmit={handleEditSupplier}
       />

       <DeleteSupplierModal
         isOpen={showDeleteModal}
         onClose={() => {
           setShowDeleteModal(false);
           setSelectedSupplier(null);
         }}
         supplier={selectedSupplier}
         onConfirm={handleDeleteSupplier}
       />

      <ViewSupplierItemsModal
        isOpen={showViewItemsModal}
        onClose={() => {
          setShowViewItemsModal(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
      />
    </div>
  );
}
