"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getSales, importIsellerSales, importQuinosSales, importSales } from "@/services/salesService";
import { SalesType } from "@/types/SalesType";
import SalesTable from "@/components/sales/SalesTable";
// import SalesCharts from "@/components/sales/SalesCharts";
import SalesAIRecommendations from "@/components/sales/SalesAIRecommendations";
import ImportItemsModal from "@/components/ImportModal";
import { getBranchData } from "@/helpers/misc";
import ImportSalesFromQuinos from "@/components/sales/ImportSalesFromQuinos";
import ImportSalesFromIseller from "@/components/sales/ImportSalesFromIseller";

export default function SalesPage() {
  const [allSales, setAllSales] = useState<SalesType[]>([]);
  const [filteredSales, setFilteredSales] = useState<SalesType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [quinosImportModalOpen, setQuinosImportModalOpen] = useState(false);
  const [quinosNotFoundProductCodes, setQuinosNotFoundProductCodes] = useState<string[]>([]);
  const [isellerImportModalOpen, setIsellerImportModalOpen] = useState(false);
  const [isellerNotFoundProductCodes, setIsellerNotFoundProductCodes] = useState<string[]>([]);

  // Date range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load sales on component mount
  useEffect(() => {
    loadSales();
  }, []);

  // Filter sales when date range changes
  useEffect(() => {
    filterSalesByDateRange();
  }, [allSales, startDate, endDate]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const branch = await getBranchData();
      if (!branch) {
        toast.error("Branch not found");
        return;
      }
      const response = await getSales(1, 1000, branch.id);

      if (response.isSuccess) {
        setAllSales(response.data);
      } else {
        toast.error(response.message || "Failed to load sales data");
      }
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const filterSalesByDateRange = () => {
    let filtered = [...allSales];

    if (startDate || endDate) {
      filtered = allSales.filter(sale => {
        const saleDate = new Date(sale.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Set end date to end of day for inclusive filtering
        if (end) {
          end.setHours(23, 59, 59, 999);
        }

        if (start && end) {
          return saleDate >= start && saleDate <= end;
        } else if (start) {
          return saleDate >= start;
        } else if (end) {
          return saleDate <= end;
        }
        return true;
      });
    }

    setFilteredSales(filtered);
  };

  const handleExportSales = async () => {
    try {
      setActionLoading(true);

      // In a real application, this would call an export service
      // For now, we'll just show a success message
      toast.success("Sales data exported successfully");

      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error("Error exporting sales:", error);
      toast.error("Failed to export sales data");
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportSales = async (importedSales: File) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("file", importedSales);
      const response = await importSales(formData);

      if (response.success) {
        // Reload sales to get the updated list
        await loadSales();
        setImportModalOpen(false);
        toast.success(response.message || "Import sales successfully", {
          duration: 4000,
          style: {
            fontWeight: '600',
          },
        });
      } else {
        toast.error(response.message || "Failed to import sales");
      }
    } catch (error) {
      console.error("Error importing sales:", error);
      toast.error("Failed to import sales");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuinosImportSales = async (importedSales: File, date: string, forceImport: boolean) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("file", importedSales);
      const response = await importQuinosSales(formData, date, forceImport);

      if (response.success) {
        await loadSales();
        setQuinosImportModalOpen(false);
        toast.success(response.message || "Import sales from Quinos successfully", {
          duration: 4000,
          style: {
            fontWeight: '600',
          },
        });
      } else {
        if (response.not_found_product_codes && response.not_found_product_codes.length > 0) {
          setQuinosNotFoundProductCodes(response.not_found_product_codes);
          setQuinosImportModalOpen(true);
        } else {
          toast.error(response.message || "Failed to import sales");
        }
      }
    } catch (error) {
      console.error("Error importing sales:", error);
      toast.error("Failed to import sales");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIsellerImportSales = async (importedSales: File, forceImport: boolean) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("file", importedSales);
      const response = await importIsellerSales(formData, forceImport);

      if (response.success) {
        await loadSales();
        setIsellerImportModalOpen(false);
        toast.success(response.message || "Import sales from Iseller successfully", {
          duration: 4000,
          style: {
            fontWeight: '600',
          },
        });
      } else {
        if (response.not_found_product_codes && response.not_found_product_codes.length > 0) {
          setIsellerNotFoundProductCodes(response.not_found_product_codes);
          setIsellerImportModalOpen(true);
        } else {
          toast.error(response.message || "Failed to import sales");
        }
      }
    }
    catch (error) {
      console.error("Error importing sales:", error);
      toast.error("Failed to import sales");
    } finally {
      setActionLoading(false);
    }
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // Calculate stats using filtered data
  const sales = filteredSales;
  const totalSales = sales.length;
  const uniqueRecipes = new Set(sales.map(sale => sale.recipe_id)).size;
  const todaysSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and analyze your sales transactions and recipe performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex space-x-4">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
            <div className="text-xs text-gray-500">Total Sales</div>
          </div>
          {/* <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{todaysSales}</div>
            <div className="text-xs text-gray-500">Today's Sales</div>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{uniqueRecipes}</div>
            <div className="text-xs text-gray-500">Unique Recipes</div>
          </div>
           */}
        </div>
      </div>

      {/* Date Range Picker */}
      {/* <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filter by Date Range</h3>
          {(startDate || endDate) && (
            <button
              onClick={clearDateFilter}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex-shrink-0 self-end">
            <div className="text-sm text-gray-600">
              Showing {totalSales} of {allSales.length} sales
            </div>
          </div>
        </div>
      </div> */}

      {/* Sales Charts */}
      {/* <SalesCharts sales={sales} /> */}

      {/* AI Recommendations */}
      <SalesAIRecommendations
        sales={sales}
        loading={loading}
      />

      {/* Sales Table */}
      <SalesTable
        sales={sales}
        loading={loading}
        onExport={handleExportSales}
        onImport={() => setImportModalOpen(true)}
        onQuinosImport={() => setQuinosImportModalOpen(true)}
        onIsellerImport={() => setIsellerImportModalOpen(true)}
      />

      {/* Import Sales Modal */}
      {/* <ImportItemsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportSales}
        loading={actionLoading}
      /> */}

      <ImportSalesFromQuinos
        isOpen={quinosImportModalOpen}
        onClose={() => {
          setQuinosImportModalOpen(false);
          setQuinosNotFoundProductCodes([]);
        }}
        onImport={handleQuinosImportSales}
        loading={actionLoading}
        notFoundProductCodes={quinosNotFoundProductCodes}
      />

      <ImportSalesFromIseller
        isOpen={isellerImportModalOpen}
        onClose={() => {
          setIsellerImportModalOpen(false);
          setIsellerNotFoundProductCodes([]);
        }}
        onImport={handleIsellerImportSales}
        loading={actionLoading}
        notFoundProductCodes={isellerNotFoundProductCodes}
      />
    </div>
  );
} 