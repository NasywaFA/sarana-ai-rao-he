"use client";

import { useState } from "react";
import { RecipeType } from "@/types/RecipeType";
import { usePagination } from "@/helpers/usePagination";
import Pagination from "@/components/Pagination";
import { CookingPotIcon, DownloadCloudIcon, UploadCloudIcon } from "lucide-react";
import {
  PencilIcon,
  SearchIcon,
  UploadIcon,
  ListIcon,
  EditIcon,
  Trash2Icon,
} from "lucide-react";

interface RecipesTableProps {
  recipes: RecipeType[];
  loading?: boolean;
  onEdit: (recipe: RecipeType) => void;
  onImport: () => void;
  onCreate: () => void;
  onDelete: (recipe: RecipeType) => void;
  onViewIngredients: (recipe: RecipeType) => void;
  onCook: (recipe: RecipeType) => void;
}

type TabType = "all" | "half_finished" | "finished";

export default function RecipesTable({
  recipes,
  loading,
  onEdit,
  onImport,
  onCreate,
  onDelete,
  onViewIngredients,
  onCook,
}: RecipesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const tabs = [
    {
      id: "all" as TabType,
      label: "All",
      fullLabel: "All Recipes",
      count: recipes.length,
    },
    {
      id: "half_finished" as TabType,
      label: "Half",
      fullLabel: "Half Finished",
      count: recipes.filter((recipe) => recipe.type === "half_finished").length,
    },
    {
      id: "finished" as TabType,
      label: "Finished (Menu)",
      fullLabel: "Finished (Menu)",
      count: recipes.filter((recipe) => recipe.type === "finished").length,
    },
  ];

  const filterRecipes = (recipe: RecipeType) => {
    if (activeTab !== "all" && recipe.type !== activeTab) {
      return false;
    }

    if (searchTerm) {
      return (
        recipe.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return true;
  };

  const pagination = usePagination({
    data: recipes,
    filterFn: filterRecipes,
    dependencies: [searchTerm, activeTab],
  });

  const getTypeBadge = (type: string) => {
    const badgeClasses = {
      half_finished: "bg-yellow-100 text-yellow-800",
      finished: "bg-green-100 text-green-800",
    };

    return (
      badgeClasses[type as keyof typeof badgeClasses] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getAdditionalContext = () => {
    if (activeTab !== "all") {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recipes</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Manage your recipe formulations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Create Recipe
            </button>
            <button
              onClick={onImport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <UploadCloudIcon className="w-4 h-4 mr-2" />
              Import Recipes
            </button>
            <a
              href="/sample-recipes.csv"
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
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                  <span className="sm:hidden">{tab.label}</span>
                  <span
                    className={`ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-xs ${activeTab === tab.id
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
              <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab === "all"
                  ? "all recipes"
                  : tabs.find((t) => t.id === activeTab)?.label.toLowerCase()
                }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagination.currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 sm:px-6 py-8 text-center text-xs sm:text-sm text-gray-500"
                  >
                    {searchTerm
                      ? `No recipes found matching your search in ${activeTab === "all"
                        ? "all categories"
                        : tabs
                          .find((t) => t.id === activeTab)
                          ?.label.toLowerCase()
                      }.`
                      : activeTab === "all"
                        ? "No recipes available."
                        : `No ${tabs
                          .find((t) => t.id === activeTab)
                          ?.label.toLowerCase()} recipes available.`}
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((recipe) => (
                  <tr
                    key={recipe.code}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {recipe.code}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {recipe.name}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(
                          recipe.type
                        )}`}
                      >
                        {formatType(recipe.type)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onViewIngredients(recipe)}
                        className="inline-flex cursor-pointer items-center px-2 py-1 text-xs sm:text-sm font-medium text-green-600 hover:text-green-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1 rounded-md transition-colors"
                      >
                        <ListIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Ingredients
                      </button>

                      {recipe.type === "half_finished" && (
                        <>
                          <br />
                          <button
                            onClick={() => onCook(recipe)}
                            className="inline-flex cursor-pointer items-center px-2 py-1 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 rounded-md transition-colors"
                          >
                            <CookingPotIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Cook
                          </button>
                        </>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-end flex-wrap gap-1 sm:gap-2">
                        <button
                          onClick={() => onEdit(recipe)}
                          className="inline-flex cursor-pointer items-center px-2 py-1 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 rounded-md transition-colors"
                        >
                          <EditIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(recipe)}
                          className="inline-flex cursor-pointer items-center px-2 py-1 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 rounded-md transition-colors"
                        >
                          <Trash2Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
        totalItems={recipes.length}
        filteredItems={pagination.filteredItems.length}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        itemLabel="recipe"
        itemLabelPlural="recipes"
        additionalContext={getAdditionalContext()}
      />
    </div>
  );
}
