"use server";

import { cookies } from "next/headers";
import { requestToAuthService } from "../helpers/request";

interface PersonalData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface CompanyData {
  name: string;
  description: string;
  business_category: string;
  address: string;
}

interface RegisterData {
  personal: PersonalData;
  company: CompanyData;
}

export async function register(formData: RegisterData) {
  try {
    // Step 1: Create company first
    const companyResponse = await requestToAuthService("companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.company.name,
        description: formData.company.description,
        business_category: formData.company.business_category,
        address: formData.company.address,
      }),
    });

    const companyData = await companyResponse.json();

    if (!companyResponse.ok) {
      console.error("Error creating company: ", companyData);
      if (companyData.message) {
        return { success: false, error: companyData.message };
      }
      return { success: false, error: "Failed to create company. Please try again later." };
    }

    // Extract company_id from response
    const companyId = companyData.data?.id;
    if (!companyId) {
      console.error("Company ID not found in response: ", companyData);
      return { success: false, error: "Company creation failed. Please try again later." };
    }

    // Step 2: Register user with company_id
    const userResponse = await requestToAuthService("auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.personal.name,
        email: formData.personal.email,
        password: formData.personal.password,
        role: formData.personal.role,
        company_id: companyId,
      }),
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error("Error register user: ", userData);
      if (userData.message) {
        return { success: false, error: userData.message };
      }
      return { success: false, error: "Registration failed. Please try again later." };
    }

    // Auto-login after successful registration if tokens are provided
    if (userData.tokens?.access?.token) {
      const cookieStore = cookies();
      const projectName = process.env.PROJECT_NAME || 'app';

      // Set auth_token cookie with project prefix
      (await cookieStore).set(`${projectName}_auth_token`, userData.tokens.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      // Set refresh_token cookie with project prefix
      if (userData.tokens?.refresh?.token) {
        (await cookieStore).set(`${projectName}_refresh_token`, userData.tokens.refresh.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      }

      // Set user cookie with project prefix
      (await cookieStore).set(
        `${projectName}_user`,
        JSON.stringify({
          id: userData.user.id,
          name: userData.user.name,
          email: userData.user.email,
          role: userData.user.role,
          business_category: userData.user.business_category,
          verified_email: userData.user.verified_email,
          company_id: userData.user.company_id, // Include company_id in user data
        }),
        {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        }
      );

      // Set the username for access to the service with project prefix (use email as fallback)
      (await cookieStore).set(`${projectName}_username`, userData.user.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return { 
      success: true, 
      user: userData.user,
      company: companyData.data,
      message: userData.message || "Registration successful! Welcome to Sarana Omni."
    };
  } catch (error) {
    console.error("Register error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: "Something went wrong. Please try again later."
    };
  }
}
