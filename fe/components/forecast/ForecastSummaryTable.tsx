import { ForecastData } from "@/types/ForecastType";
import { Info } from "lucide-react";
import { useState } from "react";
import CallSupplierDialog from "./CallSupplierDialog";
import { ItemTypeWithQuantity, ItemTypeWithQuantityAndNotEnoughItems } from "@/types/ItemType";

interface ForecastSummaryTableProps {
  forecastData: ForecastData[];
}

export default function ForecastSummaryTable({ forecastData }: ForecastSummaryTableProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [selectedInsufficientItems, setSelectedInsufficientItems] = useState<ItemTypeWithQuantityAndNotEnoughItems[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<{ name: string; code: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // Sort forecast data by date in ascending order
  const sortedForecastData = [...forecastData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get all unique recipes from all dates
  const allRecipes = new Map<string, { recipe_name: string; recipe_code: string }>();
  
  sortedForecastData.forEach(data => {
    data.items.forEach(item => {
      if (!allRecipes.has(item.recipe_code)) {
        allRecipes.set(item.recipe_code, {
          recipe_name: item.recipe_name,
          recipe_code: item.recipe_code
        });
      }
    });
  });

  const uniqueRecipes = Array.from(allRecipes.values());

  // Get total value for a specific recipe on a specific date
  const getTotalForRecipeOnDate = (recipeCode: string, dateData: ForecastData) => {
    const recipeItems = dateData.items.filter(item => item.recipe_code === recipeCode);
    return recipeItems.reduce((sum, item) => sum + item.value, 0);
  };

  // Get the type of a specific recipe on a specific date
  const getTypeForRecipeOnDate = (recipeCode: string, dateData: ForecastData) => {
    const recipeItem = dateData.items.find(item => item.recipe_code === recipeCode);
    return recipeItem?.type || null;
  };

  // Handle click on insufficient ingredients
  const handleInsufficientIngredientsClick = (recipeCode: string, recipeName: string, dateData: ForecastData) => {
    const recipeItem = dateData.items.find(item => item.recipe_code === recipeCode);
    if (recipeItem && !recipeItem.is_ingredients_enough && recipeItem.not_enough_items.length > 0) {
      setSelectedInsufficientItems(recipeItem.not_enough_items);
      setSelectedRecipe({ name: recipeName, code: recipeCode });
      setSelectedDate(dateData.date);
      setShowSupplierDialog(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Menu Forecast Summary</h3>
          <div className="relative">
            <Info 
              className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap">
                <div className="text-center">
                  <div className="font-semibold mb-1">Data Types:</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                    <span className="font-bold">Real</span> - Actual historical data
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                    <span className="text-gray-300">Forecast</span> - Predicted future data
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Detailed breakdown of total sales by recipe and date
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Recipe
              </th>
              {sortedForecastData.map((data, index) => {
                const date = new Date(data.date);
                return (
                  <th key={index} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col">
                      <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="text-gray-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uniqueRecipes.map((recipe, recipeIndex) => (
              <tr key={recipeIndex} className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                  {recipe.recipe_name}
                  <br />
                  {recipe.recipe_code}
                </td>
                {sortedForecastData.map((dateData, dateIndex) => {
                  const total = getTotalForRecipeOnDate(recipe.recipe_code, dateData);
                  const type = getTypeForRecipeOnDate(recipe.recipe_code, dateData);
                  
                  // Apply styling based on type
                  let typeClasses = '';
                  let isClickable = false;
                  if (type === 'real') {
                    typeClasses = 'text-base font-bold text-blue-600';
                  } else if (type === 'forecast') {
                    if (dateData.items.find(item => item.recipe_code === recipe.recipe_code)?.is_ingredients_enough) {
                      typeClasses = 'text-xs font-medium text-blue-600';
                    } else {
                      typeClasses = 'text-xs font-bold text-red-600 underline cursor-pointer';
                      isClickable = true;
                    }
                  } else {
                    typeClasses = 'text-sm font-medium text-gray-400';
                  }
                  
                  return (
                    <td key={dateIndex} className="px-6 py-4 whitespace-nowrap text-center">
                      <div 
                        className={typeClasses} 
                        title={`${type === 'forecast' && !dateData.items.find(item => item.recipe_code === recipe.recipe_code)?.is_ingredients_enough ? `Insufficient ingredients:\n\n${dateData.items.find(item => item.recipe_code === recipe.recipe_code)?.not_enough_items.map(item => `${item.name} (-${item.quantity} ${item.unit})`).join('\n')}` : ''}`}
                        onClick={isClickable ? () => handleInsufficientIngredientsClick(recipe.recipe_code, recipe.recipe_name, dateData) : undefined}
                      >
                        <span className={`${type === 'forecast' && !dateData.items.find(item => item.recipe_code === recipe.recipe_code)?.is_ingredients_enough ? 'hover:bg-gray-200 transition duration-300' : ''} p-4 rounded-full`}>
                          {total > 0 ? total : '-'}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Call Supplier Dialog */}
      <CallSupplierDialog
        isOpen={showSupplierDialog}
        onClose={() => setShowSupplierDialog(false)}
        insufficientItems={selectedInsufficientItems}
        recipeName={selectedRecipe?.name || ""}
        recipeCode={selectedRecipe?.code || ""}
        date={selectedDate}
      />
    </div>
  );
} 