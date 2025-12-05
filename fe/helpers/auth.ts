"use server";

import { cookies } from "next/headers";
import { UserType } from "@/types/UserType";
import { requestToAuthService } from "./request";
import { redirect } from "next/navigation";

/**
 * Get authentication token from cookies (server-side)
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';
    const token = (await cookieStore).get(`${projectName}_auth_token`)?.value;
    return token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Get refresh token from cookies (server-side)
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';
    const token = (await cookieStore).get(`${projectName}_refresh_token`)?.value;
    return token || null;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Set new tokens after refresh (server-side)
 */
export async function setTokens(accessToken: string, refreshToken?: string): Promise<void> {
  try {
    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';

    // Set new access token
    (await cookieStore).set(`${projectName}_auth_token`, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Set new refresh token if provided
    if (refreshToken) {
      (await cookieStore).set(`${projectName}_refresh_token`, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }
  } catch (error) {
    console.error('Error setting tokens:', error);
  }
}

/**
 * Clear all authentication tokens (server-side)
 */
export async function clearTokens(): Promise<void> {
  try {
    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';
    
    (await cookieStore).delete(`${projectName}_auth_token`);
    (await cookieStore).delete(`${projectName}_refresh_token`);
    (await cookieStore).delete(`${projectName}_user`);
    (await cookieStore).delete(`${projectName}_username`);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

/**
 * Refresh authentication token using refresh token
 */
export async function refreshAuthToken(): Promise<{ success: boolean; accessToken?: string }> {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      console.error('No refresh token available');
      return { success: false };
    }

    const response = await requestToAuthService("auth/refresh-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error refreshing token: ", data);
      
      // If refresh token is invalid, clear all tokens
      if (response.status === 401 || response.status === 403) {
        console.log("Refresh token is invalid, clearing all tokens");
        await clearTokens();
      }
      
      return { success: false };
    }

    if (!data.tokens?.access?.token) {
      console.error("Error refresh token response - access token not found: ", data);
      return { success: false };
    }

    // Set new tokens
    await setTokens(data.tokens.access.token, data.tokens.refresh?.token);

    return { success: true, accessToken: data.tokens.access.token };
  } catch (error) {
    console.error("Refresh token error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return { success: false };
  }
}

/**
 * Get user information from cookies (server-side)
 */
export async function getUserInfo(): Promise<UserType | null> {
  try {
    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';
    const userCookie = (await cookieStore).get(`${projectName}_user`)?.value;
    
    if (!userCookie) {
      return null;
    }

    const userData = JSON.parse(userCookie);
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      business_category: userData.business_category,
      verified_email: userData.verified_email,
      company_id: userData.company_id,
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

/**
 * Get username from cookies (server-side)
 */
export async function getUsername(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';
    const username = (await cookieStore).get(`${projectName}_username`)?.value;
    return username || null;
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
} 