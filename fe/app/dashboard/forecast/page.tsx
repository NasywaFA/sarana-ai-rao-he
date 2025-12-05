"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getProcessedForecast, sendAlertEmail, sendAlertWhatsapp } from "@/services/forecastService";
import { getRecipes } from "@/services/recipeService";
import { getIngredientRecommendations, PurchaseRecommendationData } from "@/services/recommendationService";
import { ForecastData } from "@/types/ForecastType";
import { RecipeType } from "@/types/RecipeType";
import ForecastChart from "@/components/forecast/ForecastChart";
import ForecastSummaryTable from "@/components/forecast/ForecastSummaryTable";
import AIRecommendations from "@/components/forecast/AIRecommendations";
import { getCurrentBranchWithDetails } from "@/services/branchesService";

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<RecipeType[]>([]);
  const [selectedRecipeCodes, setSelectedRecipeCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSendAlertEmail, setLoadingSendAlertEmail] = useState(false);
  const [loadingSendWhatsapp, setLoadingSendWhatsapp] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recommendations, setRecommendations] = useState<PurchaseRecommendationData | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  // Load forecast data and recipes on component mount
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecommendations = useCallback(async () => {
    try {
      setRecommendationsLoading(true);

      const response = await getIngredientRecommendations(forecastData, selectedRecipeCodes);

      if (response.isSuccess) {
        setRecommendations(response.data);
        toast.success("AI recommendations generated successfully");
      } else {
        toast.error(response.message || "Failed to generate recommendations");
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setRecommendationsLoading(false);
    }
  }, [forecastData, selectedRecipeCodes]);

  // Load recommendations when forecast data changes
  useEffect(() => {
    if (forecastData.length > 0 && selectedRecipeCodes.length > 0) {
      loadRecommendations();
    } else {
      setRecommendations(null);
    }
  }, [forecastData, selectedRecipeCodes, loadRecommendations]);

  const loadRecipes = async () => {
    try {
      setRecipesLoading(true);

      // Get current branch
      const branch = await getCurrentBranchWithDetails();
      if (!branch.isSuccess) {
        toast.error(branch.message || "Failed to get current branch");
        return;
      }

      const response = await getRecipes(1, 1000, branch.data!.id); // Get all recipes

      if (response.isSuccess) {
        const finishedRecipes = response.data.filter(recipe => recipe.type === 'finished');
        setAvailableRecipes(finishedRecipes);
      } else {
        toast.error(response.message || "Failed to load menu items");
      }
    } catch (error) {
      console.error("Error loading recipes:", error);
      toast.error("Failed to load menu items");
    } finally {
      setRecipesLoading(false);
    }
  };

  const loadForecast = async () => {
    try {
      setLoading(true);

      // Pass selected recipe codes to the API instead of filtering client-side
      const response = await getProcessedForecast(
        selectedRecipeCodes.length > 0 ? selectedRecipeCodes : undefined
      );

      if (response.isSuccess) {
        setForecastData(response.data);
        toast.success("Menu forecast data loaded successfully");
      } else {
        toast.error(response.message || "Failed to load menu forecast data");
      }
    } catch (error) {
      console.error("Error loading forecast:", error);
      toast.error("Failed to load menu forecast data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadForecast();
  };

  const handleRecipeSelection = (recipeCode: string) => {
    setSelectedRecipeCodes(prev => {
      if (prev.includes(recipeCode)) {
        return prev.filter(code => code !== recipeCode);
      } else {
        return [...prev, recipeCode];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRecipeCodes.length === filteredRecipes.length) {
      setSelectedRecipeCodes([]);
    } else {
      setSelectedRecipeCodes(filteredRecipes.map(recipe => recipe.code));
    }
  };

  const handleClearSelection = () => {
    setSelectedRecipeCodes([]);
  };

  const handleLoadForecast = async () => {
    if (selectedRecipeCodes.length === 0) {
      toast.error("Please select at least one menu item");
      return;
    }
    await loadForecast();
  };

  const handleSendWhatsapp = async () => {
    try {
      setLoadingSendWhatsapp(true);
      const response = await sendAlertWhatsapp();

      if (response.isSuccess) {
        toast.success("Alert Whatsapp sent successfully");
      } else {
        toast.error(response.message || "Failed to send alert Whatsapp");
      }
    } catch (error) {
      console.error("Error sending alert Whatsapp:", error);
      toast.error("Failed to send alert Whatsapp");
    } finally {
      setLoadingSendWhatsapp(false);
    }
  };

  const handleSendAlertEmail = async () => {
    try {
      setLoadingSendAlertEmail(true);
      const response = await sendAlertEmail();

      if (response.isSuccess) {
        toast.success("Alert email sent successfully");
      } else {
        toast.error(response.message || "Failed to send alert email");
      }
    } catch (error) {
      console.error("Error sending alert email:", error);
      toast.error("Failed to send alert email");
    } finally {
      setLoadingSendAlertEmail(false);
    }
  };

  // Filter recipes based on search query
  const filteredRecipes = availableRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalRealSales = forecastData?.reduce((sum, data) => {
    return sum + data.items.filter(item => item.type === 'real').reduce((itemSum, item) => itemSum + item.value, 0);
  }, 0);

  const totalForecastSales = forecastData?.reduce((sum, data) => {
    return sum + data.items.filter(item => item.type === 'forecast').reduce((itemSum, item) => itemSum + item.value, 0);
  }, 0);

  const totalDataPoints = forecastData?.length;

  // Calculate total items
  const totalRealItems = forecastData?.reduce((sum, data) => {
    return sum + data.items.filter(item => item.type === 'real').length;
  }, 0);

  const totalForecastItems = forecastData?.reduce((sum, data) => {
    return sum + data.items.filter(item => item.type === 'forecast').length;
  }, 0);

  // Get unique menu items from selected data
  const selectedMenuItems = Array.from(new Set(
    forecastData?.flatMap(data =>
      data.items.map(item => `${item.recipe_code} - ${item.recipe_name}`)
    )
  ));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Forecast</h1>
          <p className="text-sm text-gray-600 mt-1">
            Analyze processed menu forecast data with real sales comparison
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          <button
            onClick={handleLoadForecast}
            disabled={selectedRecipeCodes.length === 0 || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Load Forecast'}
          </button>
        </div>
      </div>

      {/* Menu Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Select Menu Items</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose multiple menu codes to analyze their forecast data
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              disabled={recipesLoading}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {selectedRecipeCodes.length === filteredRecipes.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedRecipeCodes.length > 0 && (
              <button
                onClick={handleClearSelection}
                disabled={recipesLoading}
                className="text-sm text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {recipesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search menu items by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600">
                  Showing {filteredRecipes.length} of {availableRecipes.length} menu items
                </p>
              )}
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <label
                    key={recipe.id}
                    className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipeCodes.includes(recipe.code)}
                      onChange={() => handleRecipeSelection(recipe.code)}
                      disabled={loading}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {recipe.name}
                        <br />
                        <span className="text-xs text-gray-500">{recipe.code}</span>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No menu items found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {selectedRecipeCodes.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                <span className="font-medium">{selectedRecipeCodes.length}</span> menu item(s) selected
                {selectedMenuItems.length > 0 && (
                  <>: {selectedMenuItems.slice(0, 3).join(', ')}
                    {selectedMenuItems.length > 3 && ` and ${selectedMenuItems.length - 3} more...`}</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadForecast}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'Loading...' : 'Load Forecast'}
                </button>
                {forecastData.length > 0 && (
                  <button
                    onClick={handleSendAlertEmail}
                    disabled={loadingSendAlertEmail}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {loadingSendAlertEmail ? 'Sending...' : 'Send Email to PICs'}
                  </button>
                )}
                {forecastData.length > 0 && (
                  <button
                    onClick={handleSendWhatsapp}
                    disabled={loadingSendWhatsapp}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 me-2" fill="#fff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 30.667 30.667" xmlSpace="preserve" stroke="#fff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M30.667,14.939c0,8.25-6.74,14.938-15.056,14.938c-2.639,0-5.118-0.675-7.276-1.857L0,30.667l2.717-8.017 c-1.37-2.25-2.159-4.892-2.159-7.712C0.559,6.688,7.297,0,15.613,0C23.928,0.002,30.667,6.689,30.667,14.939z M15.61,2.382 c-6.979,0-12.656,5.634-12.656,12.56c0,2.748,0.896,5.292,2.411,7.362l-1.58,4.663l4.862-1.545c2,1.312,4.393,2.076,6.963,2.076 c6.979,0,12.658-5.633,12.658-12.559C28.27,8.016,22.59,2.382,15.61,2.382z M23.214,18.38c-0.094-0.151-0.34-0.243-0.708-0.427 c-0.367-0.184-2.184-1.069-2.521-1.189c-0.34-0.123-0.586-0.185-0.832,0.182c-0.243,0.367-0.951,1.191-1.168,1.437 c-0.215,0.245-0.43,0.276-0.799,0.095c-0.369-0.186-1.559-0.57-2.969-1.817c-1.097-0.972-1.838-2.169-2.052-2.536 c-0.217-0.366-0.022-0.564,0.161-0.746c0.165-0.165,0.369-0.428,0.554-0.643c0.185-0.213,0.246-0.364,0.369-0.609 c0.121-0.245,0.06-0.458-0.031-0.643c-0.092-0.184-0.829-1.984-1.138-2.717c-0.307-0.732-0.614-0.611-0.83-0.611 c-0.215,0-0.461-0.03-0.707-0.03S9.897,8.215,9.56,8.582s-1.291,1.252-1.291,3.054c0,1.804,1.321,3.543,1.506,3.787 c0.186,0.243,2.554,4.062,6.305,5.528c3.753,1.465,3.753,0.976,4.429,0.914c0.678-0.062,2.184-0.885,2.49-1.739 C23.307,19.268,23.307,18.533,23.214,18.38z"></path> </g> </g></svg>
                    {loadingSendAlertEmail ? 'Sending...' : 'Send WhatsApp to PICs'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State for Forecast Data */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading menu forecast data...</p>
            <p className="text-gray-600">For the first time, this may take a few minutes...</p>
            <p className="text-gray-600">Data will cached for 24 hour</p>
          </div>
        </div>
      )}

      {/* Empty data state */}
      {!loading && (!forecastData || forecastData?.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2m-3-1v2m0 0V8m0 2h2m-5 0H9m0 0v2m0-2H7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecast Data Available</h3>
            <p className="text-gray-600 text-center max-w-md">
              {selectedRecipeCodes.length > 0
                ? "No forecast data found for the selected menu items. Try selecting different items or refresh the data."
                : "No forecast data is currently available in the system. Please check back later or contact support if this issue persists."
              }
            </p>
            <button
              onClick={handleLoadForecast}
              disabled={selectedRecipeCodes.length === 0}
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      {!loading && forecastData?.length > 0 && selectedRecipeCodes.length > 0 ? (
        <ForecastChart forecastData={forecastData} />
      ) : !loading && selectedRecipeCodes.length > 0 && (!forecastData || forecastData?.length === 0) ? null : !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Menu Items to View Forecast</h3>
            <p className="text-gray-600">Choose one or more menu items from the selection above to analyze their forecast data.</p>
          </div>
        </div>
      ) : null}

      {/* AI Recommendations Section */}
      {!loading && forecastData?.length > 0 && selectedRecipeCodes.length > 0 && (
        <AIRecommendations
          recommendations={recommendations}
          loading={recommendationsLoading}
        />
      )}

      {/* Detailed Data Table */}
      {!loading && forecastData?.length > 0 && selectedRecipeCodes.length > 0 && (
        <ForecastSummaryTable forecastData={forecastData} />
      )}
    </div>
  );
} 