"use server";
import { requestToService, requestToServiceFullPathUrl } from "@/helpers/request";
import { ForecastServiceResponse, ForecastResponse } from "@/types/ForecastType";
import { getCurrentBranch, getCurrentBranchWithDetails } from "./branchesService";
import { CommonResponse } from "@/lib/responses";

export async function getProcessedForecast(recipeCodes?: string[]): Promise<ForecastServiceResponse> {
  try {
    let url = `${process.env.BACKEND_SERVICE_URL}v1/forecast/processed`;
    
    // Add recipe codes as query parameter if provided
    if (recipeCodes && recipeCodes.length > 0) {
      const recipeCodesParam = recipeCodes.join(';');
      url += `?recipe_codes=${encodeURIComponent(recipeCodesParam)}`;
    }

    // Get current branch
    const branch = await getCurrentBranchWithDetails();
    if (!branch.isSuccess) {
      return {
        isSuccess: false,
        data: [],
        message: 'Failed to get current branch'
      }
    }
    url += `${url.includes('?') ? '&' : '?'}branch_id=${branch.data!.id}`;

    const response = await requestToServiceFullPathUrl(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        const jsonStr = await response.json();
        return {
          isSuccess: false, 
          data: [], 
          message: jsonStr.message
        };
      }

      console.error('Failed to fetch processed forecast');
      return { isSuccess: false, data: [], message: 'Failed to fetch processed forecast' };
    }

    const jsonStr: ForecastResponse = await response.json();
    return {
      isSuccess: true,
      data: jsonStr.data,
      message: jsonStr.message
    };
  } catch (error) {
    console.error('Error fetching processed forecast:', error);
    return { isSuccess: false, data: [], message: 'An unexpected error occurred while fetching processed forecast' };
  }
}

export async function sendAlertEmail(): Promise<CommonResponse<null>> {
  try {
    const branchId = await getCurrentBranch();
    if (!branchId.isSuccess) {
      return { isSuccess: false, data: null, message: "Failed to get current branch" };
    }

    const response = await requestToService(`v1/forecast/out-of-stock-email?branch_id=${branchId.data}`, {
      method: "GET"
    });

    if (!response.ok) {
      return { isSuccess: false, data: null, message: "Failed to send alert email" };
    }

    return { isSuccess: true, data: null, message: "Alert email sent" };
  } catch (error) {
    console.error("Error sending alert email:", error);
    return { isSuccess: false, data: null, message: "Failed to send alert email" };
  }
}

export async function sendAlertWhatsapp(): Promise<CommonResponse<null>> {
  try {
    const branchId = await getCurrentBranch();
    if (!branchId.isSuccess) {
      return { isSuccess: false, data: null, message: "Failed to get current branch" };
    }

    const response = await requestToService(`v1/forecast/out-of-stock-whatsapp?branch_id=${branchId.data}`, {
      method: "GET"
    });

    if (!response.ok) {
      return { isSuccess: false, data: null, message: "Failed to send alert Whatsapp" };
    }

    return { isSuccess: true, data: null, message: "Alert email sent" };
  } catch (error) {
    console.error("Error sending alert Whatsapp:", error);
    return { isSuccess: false, data: null, message: "Failed to send alert Whatsapp" };
  }
}