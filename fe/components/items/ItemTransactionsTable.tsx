"use client";

import { useState, useEffect } from "react";
import { ItemTransactionType } from "@/types/ItemType";
import { getItemTransactions } from "@/services/itemService";
import { SearchIcon } from "lucide-react";

interface ItemTransactionsTableProps {
  loading?: boolean;
}

export default function ItemTransactionsTable({ loading }: ItemTransactionsTableProps) {
  const [transactions, setTransactions] = useState<ItemTransactionType[]>([]);
  const [loadingState, setLoadingState] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Load transactions on component mount and when search/page changes
  useEffect(() => {
    loadTransactions();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadTransactions = async () => {
    try {
      setLoadingState(true);
      const response = await getItemTransactions(currentPage, itemsPerPage, searchTerm);
      
      if (response.isSuccess) {
        setTransactions(response.data);
        setTotalPages(response.paginationMetadata.totalPages);
        setTotalResults(response.paginationMetadata.totalResults);
      } else {
        console.error("Failed to load transactions:", response.message);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoadingState(false);
    }
  };

  // const formatDateTime = (dateTimeString: string) => {
  //   const date = new Date(dateTimeString);
  //   return date.toLocaleString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: '2-digit',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     timeZoneName: 'short'
  //   });
  // };

  const cleanDateTime = (dateTimeString: string) => {
    return dateTimeString
    .split(".")[0]
    .replace("T", " ")
    .replace("Z", "");
  };
  
  const getTransactionTypeBadge = (type: "in" | "out" | "transfer_in" | "transfer_out") => {

    console.log("Transaction type:", type, "Type of:", typeof type);

    const badgeClasses = {
      in: "bg-green-100 text-green-800",
      out: "bg-red-100 text-red-800",
      transfer_in: "bg-blue-100 text-blue-800",
      transfer_out: "bg-orange-100 text-orange-800",
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses[type]}`}>
        {type === "in" ? "Stock In" : type === "out" ? "Stock Out" : type === "transfer_in" ? "Transfer In" : "Transfer Out"}
      </span>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (loading || loadingState) {
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
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Item Transactions</h3>
            <p className="text-sm text-gray-600 mt-1">
              Track all stock movements and inventory changes
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-2 sm:gap-4">
            <div className="bg-blue-50 rounded-lg px-3 py-1 sm:px-4 sm:py-2 border border-blue-200">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {totalResults}
              </div>
              <div className="text-xs text-gray-500">Total Transactions</div>
            </div>
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
              placeholder="Search transactions by item name or code..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-gray-500">
                  {searchTerm ? "No transactions found matching your search." : "No transaction data available."}
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.created_at ? cleanDateTime(transaction.created_at) : "???"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.item?.name || "Unknown Item"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.item?.code || "No Code"}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {getTransactionTypeBadge(transaction.type)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.amount} {transaction.item?.unit || "units"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.current_stock} {transaction.item?.unit || "units"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.note || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Items info and per-page selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalResults)}</span> of{" "}
                <span className="font-medium">{totalResults}</span> transactions
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-700 whitespace-nowrap">
                  Show:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const delta = 2;
                  const range = [];
                  const rangeWithDots = [];

                  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                    range.push(i);
                  }

                  if (currentPage - delta > 2) {
                    rangeWithDots.push(1, '...');
                  } else {
                    rangeWithDots.push(1);
                  }

                  rangeWithDots.push(...range);

                  if (currentPage + delta < totalPages - 1) {
                    rangeWithDots.push('...', totalPages);
                  } else if (totalPages > 1) {
                    rangeWithDots.push(totalPages);
                  }

                  return rangeWithDots.map((pageNumber, index) => (
                    <span key={index}>
                      {pageNumber === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(pageNumber as number)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )}
                    </span>
                  ));
                })()}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 