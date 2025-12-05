"use server";

import { cookies } from "next/headers";
import { getAuthToken, getUsername, refreshAuthToken } from "./auth";


/**
 * Credential collection
 * 
 * @param url - The URL to request
 * @param options - The options for the request
 * @returns The response from the request
 */
export async function requestToAuthService(path: string, options: RequestInit) {
    const request = await requestWithoutCredentials(`${process.env.BACKEND_SERVICE_URL}${path}`, options);
    return request;
}

/**
 * Request to Laravel service with custom URL
 * 
 * @param urlPath - The URL path to request
 * @param options - The options for the request
 * @returns The response from the request
 */
export async function requestToService(path: string | null, options: RequestInit) {

    // Get username using helper function
    const username = await getUsername();

    // Get password from env
    const password = process.env.SERVICE_PASSWORD;
    
    const request = await requestWithCredentials(`${process.env.BACKEND_SERVICE_URL}${path}`, options, null, username, password);

    return request;
}

export async function requestToServiceFullPathUrl(fullPathUrl: string, options: RequestInit) {

    // Get username using helper function
    const username = await getUsername();

    // Get password from env
    const password = process.env.SERVICE_PASSWORD;
    
    const request = await requestWithCredentials(fullPathUrl, options, null, username, password);

    return request;

}


/**
 * Request with credentials
 * @param url - The URL to request
 * @param options - The options for the request
 * @param bearerToken - Optional bearer token to use instead of cookie token
 * @param username - Optional username for basic auth
 * @param password - Optional password for basic auth
 * @param isRetry - Internal flag to prevent infinite retry loops
 * @returns The response from the request
 */
export async function requestWithCredentials(
    url: string,
    options: RequestInit,
    bearerToken: string | null = null,
    username: string | null = null,
    password: string | null = null,
    isRetry: boolean = false
) {
    console.log("--------------------------------");
    console.log("Request with credentials to:", url);

    let authMethod = "Bearer";
    let headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    }

    if (bearerToken) {
        authMethod = "Injected Bearer";
        headers.Authorization = `Bearer ${bearerToken}`;
        console.log("Bearer Token:", bearerToken);
    } else if (username && password) {
        authMethod = "Injected Basic";
        headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    } else {
        authMethod = "Cookie Bearer";
        const authToken = await getAuthToken();
        console.log("Auth Token:", authToken);
        headers.Authorization = `Bearer ${authToken || ""}`;
    }
    console.log("Auth Method:", authMethod);
    
    const response = await fetch(url, {
        ...options,
        headers: headers,
    });

    // Clone the response to read the body
    const responseClone = response.clone();
    const responseBody = await responseClone.text();
    console.log("Response Status:", response.status);
    console.log("Response Body:", responseBody.length > 255 ? responseBody.substring(0, 255) + '...' : responseBody);
    console.log("--------------------------------");
    

    // Handle 401 responses by refreshing token and retrying (only if using cookie bearer auth and not already a retry)
    if (response.status === 401 && authMethod === "Cookie Bearer" && !isRetry && !bearerToken) {
        console.log("Got 401 response, attempting to refresh token...");
        
        const refreshResult = await refreshAuthToken();
        
        if (refreshResult.success && refreshResult.accessToken) {
            console.log("Token refreshed successfully, retrying original request...");
            // Retry the original request with the new token
            return await requestWithCredentials(url, options, refreshResult.accessToken, username, password, true);
        } else {
            console.error("Failed to refresh token, returning original 401 response");
        }
    }

    return response;
}

export async function requestWithoutCredentials(url: string, options: RequestInit) {
    console.log("--------------------------------");
    console.log("Request without credentials to:", url);

    const response = await fetch(url, options);

    // Clone the response to read the body
    const responseClone = response.clone();
    const responseBody = await responseClone.text();
    console.log("Response Body:", responseBody.length > 255 ? responseBody.substring(0, 255) + '...' : responseBody);
    console.log("--------------------------------");
    return response;
}