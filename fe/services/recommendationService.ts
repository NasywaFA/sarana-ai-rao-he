'use server';
import { requestWithCredentials } from '@/helpers/request';
import { ForecastData } from '@/types/ForecastType';

export interface IngredientRecommendation {
  ingredient_code: string;
  ingredient_name: string;
  required_quantity: number;
  unit: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost: number;
  supplier_recommendations: SupplierRecommendation[];
  reasons: string[];
  affected_recipes: string[];
}

export interface SupplierRecommendation {
  supplier_name: string;
  contact: string;
  price_per_unit: number;
  minimum_order: number;
  delivery_time: string;
  quality_rating: number;
  reliability_score: number;
}

export interface PurchaseRecommendationData {
  total_estimated_cost: number;
  urgent_items_count: number;
  recommendation_date: string;
  validity_period: string;
  ingredients: IngredientRecommendation[];
  summary: {
    total_recipes_analyzed: number;
    forecast_period: string;
    confidence_score: number;
    notes: string[];
  };
}

export interface RecommendationResponse {
  isSuccess: boolean;
  data: PurchaseRecommendationData;
  message: string;
}

/**
 * Get AI-powered ingredient purchase recommendations based on forecast data
 */
export async function getIngredientRecommendations(
  forecastData: ForecastData[],
  selectedRecipeCodes: string[]
): Promise<RecommendationResponse> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}recommendations/ingredients`;
    console.log('Fetching ingredient recommendations from:', url);
    
    const requestPayload = {
      forecast_data: forecastData,
      recipe_codes: selectedRecipeCodes,
      recommendation_type: 'ingredient_purchase'
    };

    const response = await requestWithCredentials(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      console.error(`Recommendations API error: ${response.status} ${response.statusText}`);
      
      // Return mock data for development if API is not available
      const mockData = generateMockRecommendations(forecastData, selectedRecipeCodes);
      return {
        isSuccess: true,
        data: mockData,
        message: 'Recommendations generated successfully (demo data)'
      };
    }

    const data = await response.json();
    console.log('Recommendations response:', data);
    
    return {
      isSuccess: true,
      data: data.data,
      message: data.message || 'Recommendations loaded successfully'
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    
    // Return mock data for development
    const mockData = generateMockRecommendations(forecastData, selectedRecipeCodes);
    return {
      isSuccess: true,
      data: mockData,
      message: 'Recommendations generated successfully (demo data)'
    };
  }
}

/**
 * Generate mock recommendations for development/demo purposes
 */
function generateMockRecommendations(
  forecastData: ForecastData[],
  selectedRecipeCodes: string[]
): PurchaseRecommendationData {
  // Calculate total forecast quantities
  const totalForecastQuantity = forecastData.reduce((sum, data) => {
    return sum + data.items
      .filter(item => item.type === 'forecast' && selectedRecipeCodes.includes(item.recipe_code))
      .reduce((itemSum, item) => itemSum + item.value, 0);
  }, 0);

  // Get unique recipes
  const uniqueRecipes = Array.from(new Set(
    forecastData.flatMap(data => 
      data.items
        .filter(item => selectedRecipeCodes.includes(item.recipe_code))
        .map(item => `${item.recipe_code} - ${item.recipe_name}`)
    )
  ));

  // Mock ingredient recommendations
  const mockIngredients: IngredientRecommendation[] = [
    {
      ingredient_code: "ING001",
      ingredient_name: "Premium Rice",
      required_quantity: Math.ceil(totalForecastQuantity * 0.3),
      unit: "kg",
      urgency_level: "high",
      estimated_cost: Math.ceil(totalForecastQuantity * 0.3) * 15000,
      supplier_recommendations: [
        {
          supplier_name: "PT Beras Nusantara",
          contact: "+62 21 1234567",
          price_per_unit: 15000,
          minimum_order: 50,
          delivery_time: "2-3 days",
          quality_rating: 4.5,
          reliability_score: 95
        },
        {
          supplier_name: "CV Pangan Sejahtera",
          contact: "+62 21 7654321",
          price_per_unit: 14500,
          minimum_order: 100,
          delivery_time: "3-5 days",
          quality_rating: 4.2,
          reliability_score: 88
        }
      ],
      reasons: [
        "High forecast demand for rice-based menu items",
        "Current stock level is below safety threshold",
        "Price trend analysis suggests potential increase next month"
      ],
      affected_recipes: uniqueRecipes.slice(0, 3)
    },
    {
      ingredient_code: "ING002",
      ingredient_name: "Fresh Vegetables Mix",
      required_quantity: Math.ceil(totalForecastQuantity * 0.15),
      unit: "kg",
      urgency_level: "medium",
      estimated_cost: Math.ceil(totalForecastQuantity * 0.15) * 25000,
      supplier_recommendations: [
        {
          supplier_name: "Fresh Market Suppliers",
          contact: "+62 21 5555666",
          price_per_unit: 25000,
          minimum_order: 20,
          delivery_time: "1-2 days",
          quality_rating: 4.8,
          reliability_score: 92
        }
      ],
      reasons: [
        "Seasonal availability requires advance ordering",
        "Multiple menu items require fresh vegetables",
        "Quality assurance for customer satisfaction"
      ],
      affected_recipes: uniqueRecipes.slice(1, 4)
    },
    {
      ingredient_code: "ING003",
      ingredient_name: "Cooking Oil",
      required_quantity: Math.ceil(totalForecastQuantity * 0.08),
      unit: "liter",
      urgency_level: "critical",
      estimated_cost: Math.ceil(totalForecastQuantity * 0.08) * 18000,
      supplier_recommendations: [
        {
          supplier_name: "Oil Distribution Co.",
          contact: "+62 21 9988776",
          price_per_unit: 18000,
          minimum_order: 30,
          delivery_time: "1 day",
          quality_rating: 4.3,
          reliability_score: 90
        }
      ],
      reasons: [
        "Critical stock level - only 2 days remaining",
        "Essential ingredient for most menu items",
        "Bulk purchase discount available this week"
      ],
      affected_recipes: uniqueRecipes
    }
  ];

  return {
    total_estimated_cost: mockIngredients.reduce((sum, ing) => sum + ing.estimated_cost, 0),
    urgent_items_count: mockIngredients.filter(ing => ing.urgency_level === 'high' || ing.urgency_level === 'critical').length,
    recommendation_date: new Date().toISOString(),
    validity_period: "Valid for next 7 days",
    ingredients: mockIngredients,
    summary: {
      total_recipes_analyzed: uniqueRecipes.length,
      forecast_period: `${forecastData.length} days`,
      confidence_score: 87,
      notes: [
        "Recommendations based on historical consumption patterns",
        "Prices include estimated delivery costs",
        "Consider bulk purchasing for better rates",
        "Monitor seasonal price fluctuations"
      ]
    }
  };
} 