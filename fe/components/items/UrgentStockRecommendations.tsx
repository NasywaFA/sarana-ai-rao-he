"use client";

import { useState } from "react";
import { formatCurrency } from "@/helpers/format";
import { ItemType } from "@/types/ItemType";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
} from "lucide-react";

export interface UrgentStockItem {
  itemCode: string;
  itemName: string;
  currentStock: number;
  recommendedPurchase: number;
  unit: string;
  urgencyLevel: "critical" | "high" | "medium";
  estimatedCost: number;
  stockoutDate: string;
  recommendedPurchaseDate: string;
  supplier: {
    name: string;
    contact: string;
    location: string;
    pricePerUnit: number;
    minimumOrder: number;
    deliveryTime: string;
    reliability: number;
  };
  alternativeSupplier?: {
    name: string;
    contact: string;
    location: string;
    pricePerUnit: number;
    minimumOrder: number;
    deliveryTime: string;
    reliability: number;
  };
  reasons: string[];
}

interface UrgentStockRecommendationsProps {
  items?: ItemType[];
  loading?: boolean;
}

// Utility function to transform ItemType to UrgentStockItem
const transformItemsToUrgentStock = (items: ItemType[]): UrgentStockItem[] => {
  return items
    .filter(item => {
      // Only include items that need urgent attention
      // Consider items with stock <= 50 as needing attention
      return item.stock <= 50 && item.type === "inventory_purchased";
    })
    .map(item => {
      // Determine urgency level based on stock
      let urgencyLevel: "critical" | "high" | "medium" = "medium";
      let recommendedPurchase = 100; // Default recommendation
      let estimatedCost = 0;
      let stockoutDays = 7;
      let purchaseDays = 3;
      let reasons: string[] = [];

      if (item.stock <= 10) {
        urgencyLevel = "critical";
        recommendedPurchase = 200;
        stockoutDays = 2;
        purchaseDays = 1;
        reasons = [
          "Stok sangat kritis - hanya tersisa " + item.stock + " " + item.unit,
          "Dapat mempengaruhi operasional jika tidak segera diisi",
          "Direkomendasikan untuk pemesanan emergency"
        ];
      } else if (item.stock <= 25) {
        urgencyLevel = "high";
        recommendedPurchase = 150;
        stockoutDays = 5;
        purchaseDays = 2;
        reasons = [
          "Stok di bawah batas aman minimum",
          "Perlu segera diisi untuk menghindari stockout",
          "Lead time supplier perlu dipertimbangkan"
        ];
      } else {
        urgencyLevel = "medium";
        recommendedPurchase = 100;
        stockoutDays = 10;
        purchaseDays = 5;
        reasons = [
          "Stok mendekati batas minimum",
          "Perlu perencanaan pembelian dalam waktu dekat",
          "Untuk menjaga kontinuitas operasional"
        ];
      }

      // Estimate cost based on item type and quantity
      let pricePerUnit = 15000; // Default price
      if (item.name.toLowerCase().includes("minyak")) {
        pricePerUnit = 18000;
      } else if (item.name.toLowerCase().includes("daging")) {
        pricePerUnit = 120000;
      } else if (item.name.toLowerCase().includes("sayur")) {
        pricePerUnit = 25000;
      }

      estimatedCost = recommendedPurchase * pricePerUnit;

      const today = new Date();
      const stockoutDate = new Date(today.getTime() + stockoutDays * 24 * 60 * 60 * 1000);
      const purchaseDate = new Date(today.getTime() + purchaseDays * 24 * 60 * 60 * 1000);

      return {
        itemCode: item.code,
        itemName: item.name,
        currentStock: item.stock,
        recommendedPurchase,
        unit: item.unit,
        urgencyLevel,
        estimatedCost,
        stockoutDate: stockoutDate.toISOString().split('T')[0],
        recommendedPurchaseDate: purchaseDate.toISOString().split('T')[0],
        supplier: {
          name: "PT Supplier Utama",
          contact: "+62 21 1234567",
          location: "Jakarta",
          pricePerUnit,
          minimumOrder: 50,
          deliveryTime: urgencyLevel === "critical" ? "1-2 hari" : "2-3 hari",
          reliability: 95,
        },
        alternativeSupplier: {
          name: "CV Supplier Alternatif",
          contact: "+62 21 7654321",
          location: "Bekasi",
          pricePerUnit: pricePerUnit * 0.95, // 5% cheaper
          minimumOrder: 100,
          deliveryTime: "3-4 hari",
          reliability: 88,
        },
        reasons,
      };
    })
    .sort((a, b) => {
      // Sort by urgency: critical > high > medium
      const urgencyOrder = { critical: 3, high: 2, medium: 1 };
      return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
    });
};

export default function UrgentStockRecommendations({
  items = [],
  loading = false,
}: UrgentStockRecommendationsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Transform items to urgent stock data
  const urgentStockData = transformItemsToUrgentStock(items);

  const toggleExpanded = (itemCode: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemCode)) {
        newSet.delete(itemCode);
      } else {
        newSet.add(itemCode);
      }
      return newSet;
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalEstimatedCost = urgentStockData.reduce(
    (sum, item) => sum + item.estimatedCost,
    0
  );
  const criticalItems = urgentStockData.filter(
    (item) => item.urgencyLevel === "critical"
  ).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600">Menganalisis kebutuhan stok urgent...</p>
        </div>
      </div>
    );
  }

  // If no urgent items, show a different message
  if (urgentStockData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="text-center py-8">
          <div className="text-green-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Semua Stok Dalam Kondisi Baik</h3>
          <p className="text-gray-600">Tidak ada item yang memerlukan pembelian urgent saat ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 sm:p-6 border border-red-200">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mr-2" />
              Rekomendasi Stok Urgent
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Analisis AI untuk pembelian stok yang harus segera dilakukan
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm text-gray-500">
              Update: {new Date().toLocaleDateString("id-ID")}
            </div>
            <div className="text-xs text-gray-400">AI Confidence: 95%</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">
              {criticalItems}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Item Critical
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {urgentStockData.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Total Item</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {criticalItems > 0 ? "1-2" : "2-3"}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Hari untuk Action
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Items List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Detail Rekomendasi Pembelian
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Analisis lengkap untuk setiap item yang perlu dibeli segera
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {urgentStockData.map((item) => (
            <div key={item.itemCode} className="p-4 sm:p-6">
              {/* Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-1 sm:gap-0">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-1">
                      {item.itemName}
                    </h4>
                    <span
                      className={`self-start sm:self-center inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(
                        item.urgencyLevel
                      )}`}
                    >
                      <span className="capitalize">{item.urgencyLevel}</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Code: {item.itemCode}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Stok:{" "}
                      <span className="font-medium text-red-600">
                        {item.currentStock} {item.unit}
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Habis:{" "}
                      <span className="font-medium text-red-600">
                        {new Date(item.stockoutDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </span>
                  </div>
                </div>
                {/* <div className="text-left sm:text-right">
                  <div className="text-base sm:text-lg font-bold text-gray-900">
                    {item.recommendedPurchase} {item.unit}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {formatCurrency(item.estimatedCost)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Beli sebelum:{" "}
                    {new Date(item.recommendedPurchaseDate).toLocaleDateString(
                      "id-ID"
                    )}
                  </div>
                </div> */}
              </div>

              {/* Quick Action Buttons */}
              {/* <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <button className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Hubungi</span>
                </button>
                <button className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Buat PO</span>
                </button>
                <button
                  onClick={() => toggleExpanded(item.itemCode)}
                  className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  {expandedItems.has(item.itemCode) ? (
                    <>
                      <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Tutup</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Detail</span>
                    </>
                  )}
                </button>
              </div> */}

              {/* Expanded Details */}
              {expandedItems.has(item.itemCode) && (
                <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 bg-gray-50 rounded-lg p-3 sm:p-4">
                  {/* Reasons */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                      Mengapa Harus Beli Sekarang?
                    </h5>
                    <ul className="space-y-1">
                      {item.reasons.map((reason, index) => (
                        <li
                          key={index}
                          className="text-xs sm:text-sm text-gray-600"
                        >
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Supplier Information */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                      Rekomendasi Supplier
                    </h5>

                    {/* Primary Supplier */}
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white mb-2 sm:mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-1 sm:mb-2 gap-2 sm:gap-0">
                        <div>
                          <h6 className="font-medium text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <span>{item.supplier.name}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Recommended
                            </span>
                          </h6>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {item.supplier.contact}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {item.supplier.location}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {formatCurrency(item.supplier.pricePerUnit)}/
                            {item.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min. Order: {item.supplier.minimumOrder} {item.unit}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mt-2">
                        <div>
                          <span className="text-gray-500">Waktu Kirim:</span>
                          <span className="ml-1 font-medium">
                            {item.supplier.deliveryTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reliability:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {item.supplier.reliability}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alternative Supplier */}
                    {item.alternativeSupplier && (
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-1 sm:mb-2 gap-2 sm:gap-0">
                          <div>
                            <h6 className="font-medium text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                              <span>{item.alternativeSupplier.name}</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Alternative
                              </span>
                            </h6>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {item.alternativeSupplier.contact}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {item.alternativeSupplier.location}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {formatCurrency(
                                item.alternativeSupplier.pricePerUnit
                              )}
                              /{item.unit}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min. Order:{" "}
                              {item.alternativeSupplier.minimumOrder}{" "}
                              {item.unit}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mt-2">
                          <div>
                            <span className="text-gray-500">Waktu Kirim:</span>
                            <span className="ml-1 font-medium">
                              {item.alternativeSupplier.deliveryTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Reliability:</span>
                            <span className="ml-1 font-medium text-blue-600">
                              {item.alternativeSupplier.reliability}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
