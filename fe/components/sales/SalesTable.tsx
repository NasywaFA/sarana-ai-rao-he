"use client";

import { useState } from "react";
import { SalesType } from "@/types/SalesType";
import { usePagination } from "@/helpers/usePagination";
import Pagination from "@/components/Pagination";
import {
  // DownloadCloudIcon,
  UploadCloudIcon
} from "lucide-react";
import Image from "next/image";

interface SalesTableProps {
  sales: SalesType[];
  loading?: boolean;
  onExport?: () => void;
  onImport?: () => void;
  onQuinosImport?: () => void;
  onIsellerImport?: () => void;
}

export default function SalesTable({ sales, loading, onExport, onImport, onQuinosImport, onIsellerImport }: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter function for pagination hook
  const filterSales = (sale: SalesType) => {
    if (searchTerm) {
      return (
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.recipe_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  };

  // Use pagination hook
  const pagination = usePagination({
    data: sales,
    filterFn: filterSales,
    dependencies: [searchTerm]
  });

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header with Search and Actions */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* {(onExport || onImport) && (
            <div className="flex items-center space-x-2">
              {onImport && (
                <>
                  <button
                    onClick={onImport}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                  >
                    <UploadCloudIcon className="w-4 h-4 mr-2" />
                    Import Sales
                  </button>
                  <a
                    href="/sample-sales.csv"
                    download={true}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
                  >
                    <DownloadCloudIcon className="w-4 h-4 mr-2" />
                    Download Sample CSV
                  </a>
                </>
              )}
            </div>
          )} */}

          <div className="flex items-center space-x-2">
            <button
              onClick={onQuinosImport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              {/* <UploadCloudIcon className="w-4 h-4 mr-2" /> */}
              <Image className="me-2" src="/quinos.webp" alt="quinos" width={20} height={20} />
              Import from Quinos
            </button>
            <button
              onClick={onIsellerImport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              {/* <UploadCloudIcon className="w-4 h-4 mr-2" /> */}
              <Image className="me-2" src="/iseller.webp" alt="iseller" width={20} height={20} />
              Import from iSeller
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagination.currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? "No sales found matching your search." : "No sales data available."}
                </td>
              </tr>
            ) : (
              pagination.currentItems.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDateTime(sale.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.recipe.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        itemsPerPage={pagination.itemsPerPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        totalItems={sales.length}
        filteredItems={pagination.filteredItems.length}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        itemLabel="sale"
        itemLabelPlural="sales transactions"
      />
    </div>
  );
} 