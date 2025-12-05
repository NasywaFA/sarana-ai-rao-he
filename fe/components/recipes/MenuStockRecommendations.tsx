"use client";

import { useState } from "react";
import { formatCurrency } from "@/helpers/format";
import { RecipeType } from "@/types/RecipeType";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
  CheckCircle,
  User,
} from "lucide-react";

export interface MenuStockIssue {
  recipeCode: string;
  recipeName: string;
  recipeType: "finished" | "half_finished";
  status: "out_of_stock" | "low_stock" | "critical_ingredient";
  missingIngredients: {
    code: string;
    name: string;
    requiredQuantity: number;
    currentStock: number;
    unit: string;
    urgencyLevel: "critical" | "high" | "medium";
    estimatedCost: number;
    supplier: string;
    deliveryTime: string;
  }[];
  estimatedRevenueLoss: number;
  impactLevel: "high" | "medium" | "low";
  recommendations: string[];
  actionItems: {
    priority: "urgent" | "high" | "medium";
    action: string;
    deadline: string;
    assignee?: string;
  }[];
}

interface MenuStockRecommendationsProps {
  recipes?: RecipeType[];
  loading?: boolean;
}

export default function MenuStockRecommendations({
  recipes = [],
  loading = false,
}: MenuStockRecommendationsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Dummy data for menu stock issues
  const menuStockIssues: MenuStockIssue[] = [
    {
      recipeCode: "MENU001",
      recipeName: "Nasi Gudeg Jogja Premium",
      recipeType: "finished",
      status: "out_of_stock",
      missingIngredients: [
        {
          code: "ING001",
          name: "Nangka Muda",
          requiredQuantity: 50,
          currentStock: 0,
          unit: "kg",
          urgencyLevel: "critical",
          estimatedCost: 750000,
          supplier: "PT Nangka Segar",
          deliveryTime: "2-3 hari",
        },
        {
          code: "ING002",
          name: "Santan Kelapa Segar",
          requiredQuantity: 20,
          currentStock: 5,
          unit: "liter",
          urgencyLevel: "high",
          estimatedCost: 400000,
          supplier: "CV Kelapa Nusantara",
          deliveryTime: "1-2 hari",
        },
      ],
      estimatedRevenueLoss: 15000000,
      impactLevel: "high",
      recommendations: [
        "Segera hubungi supplier untuk pemesanan emergency",
        "Pertimbangkan substitusi dengan menu alternatif sementara",
        "Informasikan kepada tim front-of-house untuk menghindari pesanan",
      ],
      actionItems: [
        {
          priority: "urgent",
          action: "Hubungi PT Nangka Segar untuk emergency order",
          deadline: "2024-12-24 10:00",
          assignee: "Manager Procurement",
        },
        {
          priority: "urgent",
          action: "Update menu availability di POS system",
          deadline: "2024-12-23 16:00",
          assignee: "Supervisor F&B",
        },
        {
          priority: "high",
          action: "Siapkan menu replacement dengan ingredients tersedia",
          deadline: "2024-12-24 08:00",
          assignee: "Head Chef",
        },
      ],
    },
    {
      recipeCode: "MENU002",
      recipeName: "Rendang Daging Sapi",
      recipeType: "finished",
      status: "critical_ingredient",
      missingIngredients: [
        {
          code: "ING003",
          name: "Daging Sapi Tenderloin",
          requiredQuantity: 30,
          currentStock: 8,
          unit: "kg",
          urgencyLevel: "critical",
          estimatedCost: 3750000,
          supplier: "PT Fresh Meat Indo",
          deliveryTime: "1 hari",
        },
      ],
      estimatedRevenueLoss: 12000000,
      impactLevel: "high",
      recommendations: [
        "Order daging sapi segera untuk memenuhi demand weekend",
        "Pertimbangkan pre-order dari customer untuk estimasi yang lebih akurat",
        "Monitor usage rate harian untuk forecasting yang lebih baik",
      ],
      actionItems: [
        {
          priority: "urgent",
          action: "Order 50kg daging sapi tenderloin",
          deadline: "2024-12-23 15:00",
          assignee: "Manager Procurement",
        },
        {
          priority: "medium",
          action: "Setup automated stock alert untuk ingredient critical",
          deadline: "2024-12-25 17:00",
          assignee: "IT Support",
        },
      ],
    },
  ];

  const toggleExpanded = (recipeCode: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeCode)) {
        newSet.delete(recipeCode);
      } else {
        newSet.add(recipeCode);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-200";
      case "critical_ingredient":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "Stok Habis";
      case "critical_ingredient":
        return "Ingredient Kritis";
      case "low_stock":
        return "Stok Rendah";
      default:
        return status;
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const totalRevenueLoss = menuStockIssues.reduce(
    (sum, issue) => sum + issue.estimatedRevenueLoss,
    0
  );
  const affectedMenus = menuStockIssues.length;
  const urgentActions = menuStockIssues.reduce(
    (sum, issue) =>
      sum +
      issue.actionItems.filter((action) => action.priority === "urgent").length,
    0
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600">Menganalisis ketersediaan menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 sm:p-6 border border-red-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mr-2" />
              Menu Availability Alert
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Menu yang belum siap karena stock habis dan action items yang
              diperlukan
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm text-gray-500">
              Update: {new Date().toLocaleDateString("id-ID")}
            </div>
            <div className="text-xs text-gray-400">AI Confidence: 94%</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {formatCurrency(totalRevenueLoss)}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Revenue Loss</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">
              {affectedMenus}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Menu Terpengaruh
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {urgentActions}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Action Urgent
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              24
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Jam Recovery</div>
          </div>
        </div>
      </div>

      {/* Affected Menus List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Menu Yang Bermasalah
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Daftar menu yang tidak tersedia atau berisiko karena masalah stok
            ingredient
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {menuStockIssues.map((issue) => (
            <div key={issue.recipeCode} className="p-4 sm:p-6">
              {/* Menu Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900">
                      {issue.recipeName}
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          issue.status
                        )}`}
                      >
                        {getStatusText(issue.status)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          issue.impactLevel === "high"
                            ? "bg-red-500 text-white"
                            : issue.impactLevel === "medium"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        Impact: {issue.impactLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Code: {issue.recipeCode} | Type: {issue.recipeType}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 gap-1 sm:gap-0">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Missing:{" "}
                      <span className="font-medium text-red-600">
                        {issue.missingIngredients.length} ingredients
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Loss:{" "}
                      <span className="font-medium text-red-600">
                        {formatCurrency(issue.estimatedRevenueLoss)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-base sm:text-lg font-bold text-red-600">
                    {issue.actionItems.length} Actions
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {
                      issue.actionItems.filter((a) => a.priority === "urgent")
                        .length
                    }{" "}
                    Urgent
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <button className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Priority</span>
                </button>
                <button className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Suppliers</span>
                </button>
                <button className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Create PO</span>
                </button>
                <button
                  onClick={() => toggleExpanded(issue.recipeCode)}
                  className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  {expandedItems.has(issue.recipeCode) ? (
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
              </div>

              {/* Expanded Details */}
              {expandedItems.has(issue.recipeCode) && (
                <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6 bg-gray-50 rounded-lg p-3 sm:p-4">
                  {/* Missing Ingredients */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                      Missing Ingredients
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {issue.missingIngredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white"
                        >
                          <div className="flex items-start justify-between mb-1 sm:mb-2">
                            <div>
                              <h6 className="font-medium text-gray-900 text-sm sm:text-base">
                                {ingredient.name}
                              </h6>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Code: {ingredient.code}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getUrgencyColor(
                                ingredient.urgencyLevel
                              )}`}
                            >
                              {ingredient.urgencyLevel}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-2 sm:mb-3">
                            <div>
                              <span className="text-gray-500">Needed:</span>
                              <span className="ml-1 font-medium text-red-600">
                                {ingredient.requiredQuantity} {ingredient.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Available:</span>
                              <span className="ml-1 font-medium">
                                {ingredient.currentStock} {ingredient.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Cost:</span>
                              <span className="ml-1 font-medium">
                                {formatCurrency(ingredient.estimatedCost)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Delivery:</span>
                              <span className="ml-1 font-medium">
                                {ingredient.deliveryTime}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-500">Supplier:</span>
                            <span className="ml-1 font-medium text-blue-600">
                              {ingredient.supplier}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                      Action Items Required
                    </h5>
                    <div className="space-y-2 sm:space-y-3">
                      {issue.actionItems.map((actionItem, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                                    actionItem.priority
                                  )}`}
                                >
                                  {actionItem.priority.toUpperCase()}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500">
                                  Due:{" "}
                                  {new Date(actionItem.deadline).toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                              <p className="text-gray-900 font-medium text-sm sm:text-base">
                                {actionItem.action}
                              </p>
                              {actionItem.assignee && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center">
                                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  {actionItem.assignee}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                              <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 rounded text-xs font-medium transition-colors">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Done</span>
                              </button>
                              <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-colors">
                                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Assign</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                      AI Recommendations
                    </h5>
                    <ul className="space-y-1">
                      {issue.recommendations.map((recommendation, index) => (
                        <li
                          key={index}
                          className="text-xs sm:text-sm text-gray-600"
                        >
                          • {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h4 className="font-medium text-blue-800 mb-1 sm:mb-2 text-sm sm:text-base">
          Next Steps
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm">
            <span className="font-medium text-blue-900">
              Immediate Actions:
            </span>
            <p className="text-blue-700">
              Contact suppliers for urgent ingredients
            </p>
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium text-blue-900">Menu Updates:</span>
            <p className="text-blue-700">Update POS and inform wait staff</p>
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium text-blue-900">Backup Plan:</span>
            <p className="text-blue-700">Prepare alternative menu items</p>
          </div>
        </div>
      </div>
    </div>
  );
}
