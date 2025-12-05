"use client";

import { useState } from "react";
import { SalesType } from "@/types/SalesType";

export interface SalesInsight {
  id: string;
  type: 'insight' | 'improvement' | 'opportunity' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'trends' | 'optimization' | 'forecasting';
  metrics?: {
    label: string;
    value: string | number;
    change?: string;
  }[];
  recommendations: string[];
  priority: number;
}

interface SalesAIRecommendationsProps {
  sales: SalesType[];
  loading?: boolean;
}

export default function SalesAIRecommendations({ sales, loading = false }: SalesAIRecommendationsProps) {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const toggleExpanded = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  // Generate AI insights based on sales data
  const generateSalesInsights = (salesData: SalesType[]): SalesInsight[] => {
    if (!salesData || salesData.length === 0) return [];

    const insights: SalesInsight[] = [];
    
    // Calculate metrics
    const totalSales = salesData.length;
    const totalQuantity = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
    const averageQuantityPerOrder = totalQuantity / totalSales;
    
    // Group by recipe
    const recipeStats = salesData.reduce((acc, sale) => {
      const key = sale.recipe_id;
      if (!acc[key]) {
        acc[key] = {
          recipeName: sale.recipe?.name || sale.recipe_name || `Recipe ${sale.recipe_id}`,
          totalQuantity: 0,
          salesCount: 0
        };
      }
      acc[key].totalQuantity += sale.quantity;
      acc[key].salesCount += 1;
      return acc;
    }, {} as Record<string, any>);

    const topRecipes = Object.entries(recipeStats)
      .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
      .slice(0, 3);

    const lowPerformingRecipes = Object.entries(recipeStats)
      .sort((a, b) => a[1].totalQuantity - b[1].totalQuantity)
      .slice(0, 2);

    // Group by date for trend analysis
    const dailySales = salesData.reduce((acc, sale) => {
      const date = new Date(sale.date).toDateString();
      if (!acc[date]) {
        acc[date] = { count: 0, quantity: 0 };
      }
      acc[date].count += 1;
      acc[date].quantity += sale.quantity;
      return acc;
    }, {} as Record<string, any>);

    const avgDailySales = Object.values(dailySales).reduce((sum: number, day: any) => sum + day.count, 0) / Object.keys(dailySales).length;
    const avgDailyQuantity = Object.values(dailySales).reduce((sum: number, day: any) => sum + day.quantity, 0) / Object.keys(dailySales).length;

    // Insight 1: Top performing products
    if (topRecipes.length > 0) {
      insights.push({
        id: "top-performers",
        type: "insight",
        title: "Top Performing Menu Items",
        description: `Your best-selling menu items account for ${((topRecipes.reduce((sum, [, stats]) => sum + stats.totalQuantity, 0) / totalQuantity) * 100).toFixed(1)}% of total quantity sold.`,
        impact: "high",
        category: "performance",
        metrics: topRecipes.map(([id, stats]) => ({
          label: stats.recipeName,
          value: `${stats.totalQuantity} units`,
          change: `${stats.salesCount} orders`
        })),
        recommendations: [
          "Consider promoting these high-performing menu items more heavily",
          "Analyze what makes these menu items successful and apply learnings to other items",
          "Ensure adequate ingredient supply for these popular items",
          "Consider creating variations or bundles with these top performers"
        ],
        priority: 1
      });
    }

    // Insight 2: Order quantity optimization opportunity
    if (averageQuantityPerOrder < 2) {
      insights.push({
        id: "quantity-optimization",
        type: "opportunity",
        title: "Order Quantity Optimization",
        description: `Your average quantity per order is ${averageQuantityPerOrder.toFixed(1)} units. There's potential to increase quantity per customer.`,
        impact: "high",
        category: "optimization",
        metrics: [
          {
            label: "Current Avg Quantity/Order",
            value: averageQuantityPerOrder.toFixed(1)
          },
          {
            label: "Target Increase",
            value: "20-30%"
          }
        ],
        recommendations: [
          "Implement bulk ordering incentives",
          "Create combo meals or bundle offers",
          "Introduce family-size portions",
          "Train staff on suggestive selling techniques",
          "Add complementary items to increase order quantity"
        ],
        priority: 2
      });
    }

    // Insight 3: Low performing products that need attention
    if (lowPerformingRecipes.length > 0) {
      insights.push({
        id: "underperformers",
        type: "warning",
        title: "Underperforming Menu Items",
        description: "Some menu items are generating low sales volume and may need attention or reconsideration.",
        impact: "medium",
        category: "performance",
        metrics: lowPerformingRecipes.map(([id, stats]) => ({
          label: stats.recipeName,
          value: `${stats.totalQuantity} units`,
          change: `${stats.salesCount} orders only`
        })),
        recommendations: [
          "Review marketing strategy for these items",
          "Consider recipe improvements or ingredient substitutions",
          "Evaluate menu placement and promotion strategies",
          "Gather customer feedback on these items",
          "Consider removing consistently poor performers from the menu"
        ],
        priority: 3
      });
    }

    // Insight 4: Daily sales patterns
    const recentDays = Object.keys(dailySales).slice(-7);
    const recentAvgSales = recentDays.reduce((sum, day) => sum + dailySales[day].count, 0) / recentDays.length;
    
    if (recentAvgSales < avgDailySales * 0.8) {
      insights.push({
        id: "sales-decline",
        type: "warning",
        title: "Recent Sales Decline Detected",
        description: "Sales volume in recent days is below the historical average, indicating a potential trend that needs attention.",
        impact: "high",
        category: "trends",
        metrics: [
          {
            label: "Recent Daily Average",
            value: Math.round(recentAvgSales),
            change: "↓ vs historical"
          },
          {
            label: "Historical Daily Average",
            value: Math.round(avgDailySales)
          }
        ],
        recommendations: [
          "Investigate potential causes for the sales decline",
          "Review recent menu changes or operational adjustments",
          "Increase marketing and promotional activities",
          "Check for operational issues affecting customer experience",
          "Monitor competitor activities in the area"
        ],
        priority: 1
      });
    }

    // Insight 5: Sales forecasting
    insights.push({
      id: "forecasting",
      type: "insight",
      title: "Sales Volume Forecasting",
      description: "Based on current sales patterns, here are projections and recommendations for inventory planning.",
      impact: "medium",
      category: "forecasting",
      metrics: [
        {
          label: "Daily Order Average",
          value: Math.round(avgDailySales)
        },
        {
          label: "Daily Quantity Average",
          value: Math.round(avgDailyQuantity)
        },
        {
          label: "Projected Monthly Orders",
          value: Math.round(avgDailySales * 30)
        }
      ],
      recommendations: [
        "Plan ingredient procurement based on top-selling items",
        "Adjust staffing levels for projected sales volume",
        "Prepare for seasonal menu adjustments",
        "Set realistic sales targets based on historical data",
        "Monitor key performance indicators weekly"
      ],
      priority: 4
    });

    return insights.sort((a, b) => a.priority - b.priority);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insight': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'improvement': return 'bg-green-100 text-green-800 border-green-200';
      case 'opportunity': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'warning': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'improvement':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const insights = generateSalesInsights(sales);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600">Generating AI insights from sales data...</p>
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Insights Available</h3>
          <p className="text-gray-600">Load sales data to get AI-powered insights and recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              AI Sales Insights & Recommendations
            </h2>
            <p className="text-sm text-gray-600 mt-1">Smart analysis of your sales performance with actionable recommendations</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Based on {sales.length} sales records</div>
            <div className="text-xs text-gray-400">{insights.length} insights generated</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.type === 'insight').length}
            </div>
            <div className="text-sm text-gray-500">Insights</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {insights.filter(i => i.type === 'opportunity').length}
            </div>
            <div className="text-sm text-gray-500">Opportunities</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.type === 'warning').length}
            </div>
            <div className="text-sm text-gray-500">Warnings</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.impact === 'high').length}
            </div>
            <div className="text-sm text-gray-500">High Impact</div>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Insights & Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">
            AI-generated analysis of your sales performance with actionable recommendations
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {insights.map((insight) => (
            <div key={insight.id} className="p-6">
              {/* Insight Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(insight.type)}`}>
                      {getTypeIcon(insight.type)}
                      <span className="ml-1 capitalize">{insight.type}</span>
                    </div>
                    <span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact.toUpperCase()} IMPACT
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {insight.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {insight.description}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              {insight.metrics && insight.metrics.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insight.metrics.map((metric, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900">
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-500">
                          {metric.label}
                        </div>
                        {metric.change && (
                          <div className="text-xs text-gray-400 mt-1">
                            {metric.change}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle Button */}
              <button
                onClick={() => toggleExpanded(insight.id)}
                className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-sm font-medium text-gray-700 transition-colors flex items-center justify-center"
              >
                {expandedInsights.has(insight.id) ? 'Hide Recommendations' : 'Show Recommendations'}
              </button>

              {/* Expanded Recommendations */}
              {expandedInsights.has(insight.id) && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Recommended Actions</h5>
                  <ul className="space-y-2">
                    {insight.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 