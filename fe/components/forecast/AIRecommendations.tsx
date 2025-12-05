"use client";

import { useState } from "react";
import { PurchaseRecommendationData } from "@/services/recommendationService";
import { formatCurrency } from "@/helpers/format";

interface AIRecommendationsProps {
  recommendations: PurchaseRecommendationData | null;
  loading: boolean;
}

export default function AIRecommendations({ recommendations, loading }: AIRecommendationsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (ingredientCode: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientCode)) {
        newSet.delete(ingredientCode);
      } else {
        newSet.add(ingredientCode);
      }
      return newSet;
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600">Generating AI recommendations...</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
          <p className="text-gray-600">Load forecast data to get AI-powered ingredient purchase recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Purchase Recommendations
            </h2>
            <p className="text-sm text-gray-600 mt-1">Smart ingredient purchasing suggestions based on forecast analysis</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{recommendations.validity_period}</div>
            <div className="text-xs text-gray-400">Confidence: {recommendations.summary.confidence_score}%</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(recommendations.total_estimated_cost)}
            </div>
            <div className="text-sm text-gray-500">Total Estimated Cost</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {recommendations.urgent_items_count}
            </div>
            <div className="text-sm text-gray-500">Urgent Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {recommendations.ingredients.length}
            </div>
            <div className="text-sm text-gray-500">Ingredients</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {recommendations.summary.total_recipes_analyzed}
            </div>
            <div className="text-sm text-gray-500">Recipes Analyzed</div>
          </div>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ingredient Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed analysis and supplier recommendations for each ingredient
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {recommendations.ingredients.map((ingredient) => (
            <div key={ingredient.ingredient_code} className="p-6">
              {/* Ingredient Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      {ingredient.ingredient_name}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(ingredient.urgency_level)}`}>
                      <span className="capitalize">{ingredient.urgency_level}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Code: {ingredient.ingredient_code}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {ingredient.required_quantity} {ingredient.unit}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(ingredient.estimated_cost)}
                  </div>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => toggleExpanded(ingredient.ingredient_code)}
                className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-sm font-medium text-gray-700 transition-colors flex items-center justify-center"
              >
                {expandedItems.has(ingredient.ingredient_code) ? 'Hide Details' : 'Show Details'}
              </button>

              {/* Expanded Details */}
              {expandedItems.has(ingredient.ingredient_code) && (
                <div className="mt-4 space-y-4">
                  {/* Reasons */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Why This Recommendation?</h5>
                    <ul className="space-y-1">
                      {ingredient.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Affected Recipes */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Affected Recipes</h5>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.affected_recipes.map((recipe, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {recipe}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Supplier Recommendations */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Recommended Suppliers</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {ingredient.supplier_recommendations.map((supplier, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h6 className="font-medium text-gray-900">{supplier.supplier_name}</h6>
                              <p className="text-sm text-gray-500">{supplier.contact}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(supplier.price_per_unit)}/{ingredient.unit}
                              </div>
                              <div className="text-xs text-gray-500">per unit</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Min Order:</span>
                              <span className="ml-1 font-medium">{supplier.minimum_order} {ingredient.unit}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Delivery:</span>
                              <span className="ml-1 font-medium">{supplier.delivery_time}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quality:</span>
                              <span className="ml-1 font-medium">{supplier.quality_rating}/5.0</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Reliability:</span>
                              <span className="ml-1 font-medium">{supplier.reliability_score}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Notes */}
      {recommendations.summary.notes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2">Important Notes</h4>
          <ul className="space-y-1">
            {recommendations.summary.notes.map((note, index) => (
              <li key={index} className="text-sm text-amber-700">
                • {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
