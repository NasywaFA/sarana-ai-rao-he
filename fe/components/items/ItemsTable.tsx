"use client";

import { useState } from "react";
import { ItemType } from "@/types/ItemType";
import { usePagination } from "@/helpers/usePagination";
import Pagination from "@/components/Pagination";
import { DownloadCloudIcon, MenuIcon, PencilIcon, SearchIcon, ShuffleIcon, TrashIcon, UploadCloudIcon } from "lucide-react";

interface ItemsTableProps {
  items: ItemType[];
  loading?: boolean;
  onEdit: (item: ItemType) => void;
  onImport: () => void;
  onCreate: () => void;
  onDelete: (item: ItemType) => void;
  onViewLogs: (item: ItemType) => void;
  onTransfer: (item: ItemType) => void;
}

type TabType = "inventory_purchased" | "half_finished";

export default function ItemsTable({
  items,
  loading,
  onEdit,
  onImport,
  onCreate,
  onDelete,
  onViewLogs,
  onTransfer,
}: ItemsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("inventory_purchased");

  const tabs = [
    {
      id: "inventory_purchased" as TabType,
      label: "Inventory",
      fullLabel: "Inventory Purchased",
      count: items.filter((item) => item.type === "inventory_purchased").length,
    },
    {
      id: "half_finished" as TabType,
      label: "Half Finished",
      fullLabel: "Half Finished",
      count: items.filter((item) => item.type === "half_finished").length,
    },
    // {
    //   id: "finished" as TabType,
    //   label: "Finished",
    //   fullLabel: "Finished",
    //   count: items.filter((item) => item.type === "finished").length,
    // },
  ];

  const filterItems = (item: ItemType) => {
    const tabMatch = item.type === activeTab;
    if (!tabMatch) return false;

    if (searchTerm) {
      return (
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return true;
  };

  const pagination = usePagination({
    data: items,
    filterFn: filterItems,
    dependencies: [searchTerm, activeTab],
  });

  const getCategoryBadge = (category: string) => {
    const badgeClasses = {
      inventory_purchased: "bg-blue-100 text-blue-800",
      half_finished: "bg-yellow-100 text-yellow-800",
      finished: "bg-green-100 text-green-800",
    };

    return (
      badgeClasses[category as keyof typeof badgeClasses] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getAdditionalContext = () => {
    if (activeTab !== "inventory_purchased") {
      return `in ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}`;
    }
    return undefined;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm border-gray-200">
      {/* Table Header */}
      <div className="px-4 py-4 sm:px-6 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <p className="text-sm text-gray-600">Manage your inventory items</p>
          </div>
          <div className="flex items-center gap-2">
          <button
              onClick={onCreate}
              className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <PencilIcon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="whitespace-nowrap">Create Item</span>
            </button>
            <button
              onClick={onImport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <UploadCloudIcon className="w-4 h-4 mr-2" />
              Import Items
            </button>
            <a
              href="/sample-inventory.csv"
              download={true}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <DownloadCloudIcon className="w-4 h-4 mr-2" />
              Download Sample CSV
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 sm:mt-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                  <span className="sm:hidden">{tab.label}</span>
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
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
              placeholder={`Search ${
                activeTab === "inventory_purchased"
                  ? "all items"
                  : tabs.find((t) => t.id === activeTab)?.label.toLowerCase()
              }...`}
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
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Waste Logs
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagination.currentItems.map((item) => (
                <tr
                  key={item.code}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sm:px-6">
                    {item.code}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 sm:px-6">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(
                        item.type
                      )}`}
                    >
                      {formatCategory(item.type)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 sm:px-6">
                    {item.stock.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 sm:px-6">
                    <button
                      onClick={() => onViewLogs(item)}
                      className="text-blue-600 cursor-pointer hover:text-blue-900 flex items-center"
                    >
                      <MenuIcon className="w-4 h-4 mr-2" /> View Logs
                    </button>
                  </td>
                  <td className="px-4 flex justify-end gap-2 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
                  <button
                      onClick={() => onTransfer(item)}
                      className="text-green-600 cursor-pointer hover:text-red-900 flex items-center"
                    >
                      <ShuffleIcon className="w-4 h-4 mr-2" /> Transfer
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 cursor-pointer hover:text-blue-900 flex items-center"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 cursor-pointer hover:text-red-900 flex items-center"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        itemsPerPage={pagination.itemsPerPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        totalItems={items.length}
        filteredItems={pagination.filteredItems.length}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        itemLabel="item"
        itemLabelPlural="items"
        additionalContext={getAdditionalContext()}
      />
    </div>
  );
}
