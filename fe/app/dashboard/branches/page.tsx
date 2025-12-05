"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BranchType } from "@/types/BranchType";
import { getBranches } from "@/services/branchesService";
import FormModal from "@/components/CreateModal";
import { AlertModal } from "@/components/confirmDelete";
import { createBranch, updateBranch, deleteBranch } from "@/services/branchesService";
import { usePagination } from "@/helpers/usePagination";
import Pagination from "@/components/Pagination";
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, PlusCircleIcon } from "lucide-react";
import AddEmailModal from "@/components/branches/AddEmailModal";
import AddPhoneModal from "@/components/branches/AddPhoneModal";

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addEmailModalOpen, setAddEmailModalOpen] = useState(false);
  const [addPhoneModalOpen, setAddPhoneModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBranches();
      if (response.isSuccess) {
        setBranches(response.data);
      } else {
        setError(response.message || "Failed to load branches");
        toast.error(response.message || "Failed to load branches");
      }
    } catch (err) {
      setError("Failed to load branches");
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const filterBranches = (branch: BranchType) => {
    if (searchTerm) {
      return (
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  };

  const pagination = usePagination({
    data: branches,
    filterFn: filterBranches,
    dependencies: [searchTerm],
  });

  // CRUD handlers
  const handleCreate = async (data: Record<string, any>) => {
    const branchData = { name: data.name, slug: data.slug };
    setActionLoading(true);
    try {
      const response = await createBranch(branchData);
      if (response.isSuccess) {
        toast.success("Branch created successfully");
        setCreateModalOpen(false);
        loadBranches();
      } else {
        toast.error(response.message || "Failed to create branch");
      }
    } catch (err) {
      toast.error("Failed to create branch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (data: Record<string, any>) => {
    const branchData = { name: data.name, slug: data.slug };
    if (!selectedBranch) return;
    setActionLoading(true);
    try {
      const response = await updateBranch(selectedBranch.id, branchData);
      if (response.isSuccess) {
        toast.success("Branch updated successfully");
        setEditModalOpen(false);
        setSelectedBranch(null);
        loadBranches();
      } else {
        toast.error(response.message || "Failed to update branch");
      }
    } catch (err) {
      toast.error("Failed to update branch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBranch) return;
    setActionLoading(true);
    try {
      const response = await deleteBranch(selectedBranch.id);
      if (response.isSuccess) {
        toast.success("Branch deleted successfully");
        setDeleteModalOpen(false);
        setSelectedBranch(null);
        loadBranches();
      } else {
        toast.error(response.message || "Failed to delete branch");
      }
    } catch (err) {
      toast.error("Failed to delete branch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmail = async (branch: BranchType, email: string) => {
    try {
      const emailsArr = branch.pic_emails.split(`,`);
      const response = await updateBranch(branch.id, {
        pic_emails: emailsArr.length > 1 ? emailsArr.filter((e) => e !== email).join(`,`) : "_none",
      });
      if (response.isSuccess) {
        toast.success("Email deleted successfully");
        loadBranches();
      } else {
        toast.error(response.message || "Failed to delete email");
      }
    } catch (err) {
      toast.error("Failed to delete email");
    }
  }

  const handleDeletePhone = async (branch: BranchType, phone: string) => {
    try {
      const phonesArr = branch.pic_phone_numbers.split(`,`);
      const response = await updateBranch(branch.id, {
        pic_phone_numbers: phonesArr.length > 1 ? phonesArr.filter((p) => p !== phone).join(`,`) : "_none",
      });
      if (response.isSuccess) {
        toast.success("Phone number deleted successfully");
        loadBranches();
      } else {
        toast.error(response.message || "Failed to delete phone number");
      }
    } catch (err) {
      toast.error("Failed to delete phone number");
    }
  }

  const handleAddEmail = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
      setAddEmailModalOpen(true);
    }
  };

  const handleAddPhone = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
      setAddPhoneModalOpen(true);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    if (!selectedBranch) return;
    setActionLoading(true);
    try {
      const currentEmails = selectedBranch.pic_emails || "";
      const newEmails = currentEmails ? `${currentEmails},${email}` : email;
      const response = await updateBranch(selectedBranch.id, {
        pic_emails: newEmails,
      });
      if (response.isSuccess) {
        toast.success("Email added successfully");
        setAddEmailModalOpen(false);
        setSelectedBranch(null);
        loadBranches();
      } else {
        toast.error(response.message || "Failed to add email");
      }
    } catch (err) {
      toast.error("Failed to add email");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhoneSubmit = async (phone: string) => {
    if (!selectedBranch) return;
    setActionLoading(true);
    try {
      const currentPhones = selectedBranch.pic_phone_numbers || "";
      const newPhones = currentPhones ? `${currentPhones},${phone}` : phone;
      const response = await updateBranch(selectedBranch.id, {
        pic_phone_numbers: newPhones,
      });
      if (response.isSuccess) {
        toast.success("Phone number added successfully");
        setAddPhoneModalOpen(false);
        setSelectedBranch(null);
        loadBranches();
      } else {
        toast.error(response.message || "Failed to add phone number");
      }
    } catch (err) {
      toast.error("Failed to add phone number");
    } finally {
      setActionLoading(false);
    }
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
            Branches Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your business branches and locations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 sm:gap-4">
          <div className="bg-white rounded-lg px-3 py-1 sm:px-4 sm:py-2 border border-blue-200">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {branches.length}
            </div>
            <div className="text-xs text-gray-500">Total Branches</div>
          </div>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-lg border shadow-sm border-gray-200">
        {/* Table Header */}
        <div className="px-4 py-4 sm:px-6 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Branches</h2>
              <p className="text-sm text-gray-600">Manage your business branches</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                <PlusIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">Add Branch</span>
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
                placeholder="Search branches..."
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
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    PIC Emails
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    PIC Phone Number
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {error ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-red-500 sm:px-6">
                      {error}
                    </td>
                  </tr>
                ) : pagination.currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500 sm:px-6">
                      {searchTerm ? "No branches found matching your search." : "No branches found."}
                    </td>
                  </tr>
                ) : (
                  pagination.currentItems.map((branch) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sm:px-6">
                        {branch.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 sm:px-6">
                        {branch.slug}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 sm:px-6">
                        <ul className="list-disc">
                          {branch.pic_emails === "" ? "" : branch.pic_emails.split(`,`).map(email => (
                            <li className="flex items-center my-2" key={email}>
                              <div className="me-2">{email}</div>
                              <button
                                type="button"
                                className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium cursor-pointer"
                                onClick={() => handleDeleteEmail(branch, email)}
                              >
                                <TrashIcon className="w-4 h-4 mr-1" />
                              </button>
                            </li>
                          ))}
                            <button
                              type="button"
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium cursor-pointer"
                              onClick={() => handleAddEmail(branch.id)}
                            >
                              <PlusCircleIcon className="w-4 h-4 mr-1" />
                              Add email
                            </button>
                        </ul>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 sm:px-6">
                        <ul className="list-disc">
                          {branch.pic_phone_numbers === "" ? "" : branch.pic_phone_numbers.split(`,`).map(phone => (
                            <li className="flex items-center my-2" key={phone}>
                              <div className="me-2">{phone}</div>
                              <button
                                type="button"
                                className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium cursor-pointer"
                                onClick={() => handleDeletePhone(branch, phone)}
                              >
                                <TrashIcon className="w-4 h-4 mr-1" />
                              </button>
                            </li>
                          ))}
                            <button
                              type="button"
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium cursor-pointer"
                              onClick={() => handleAddPhone(branch.id)}
                            >
                              <PlusCircleIcon className="w-4 h-4 mr-1" />
                              Add phone number
                            </button>
                        </ul>
                      </td>
                      <td className="px-4 flex justify-end gap-2 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
                        <button
                          onClick={() => {
                            setSelectedBranch(branch);
                            setEditModalOpen(true);
                          }}
                          className="inline-flex items-center text-blue-600 cursor-pointer hover:text-blue-900 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBranch(branch);
                            setDeleteModalOpen(true);
                          }}
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
            totalItems={branches.length}
            filteredItems={pagination.filteredItems.length}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            itemLabel="branch"
            itemLabelPlural="branches"
          />
        )}
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
        loading={actionLoading}
        title="Add Branch"
        fields={[
          { name: "name", label: "Branch Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
        ]}
      />

      {/* Edit Modal */}
      <FormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBranch(null);
        }}
        onSubmit={handleEdit}
        loading={actionLoading}
        title="Edit Branch"
        fields={[
          { name: "name", label: "Branch Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
        ]}
        initialData={selectedBranch || {}}
      />

      {/* Delete Modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBranch(null);
        }}
        onConfirm={handleDelete}
        title="Delete Branch"
        description={`Are you sure you want to delete branch "${selectedBranch?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={actionLoading}
        variant="destructive"
      />

      {/* Add Email Modal */}
      <AddEmailModal
        isOpen={addEmailModalOpen}
        onClose={() => {
          setAddEmailModalOpen(false);
          setSelectedBranch(null);
        }}
        onSubmit={handleEmailSubmit}
        loading={actionLoading}
        branchName={selectedBranch?.name}
      />

      {/* Add Phone Modal */}
      <AddPhoneModal
        isOpen={addPhoneModalOpen}
        onClose={() => {
          setAddPhoneModalOpen(false);
          setSelectedBranch(null);
        }}
        onSubmit={handlePhoneSubmit}
        loading={actionLoading}
        branchName={selectedBranch?.name}
      />
    </div>
  );
} 