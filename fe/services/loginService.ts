"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  email: string,
  password: string,
  branchId: string,
  returnUrl?: string
) {
  try {

    // Compare env email
    if (email !== process.env.DEFAULT_EMAIL) {
      return { success: false, error: "Invalid email or password" };
    }

    // Compare env password
    if (password !== process.env.DEFAULT_PASSWORD) {
      return { success: false, error: "Invalid email or password" };
    }
    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';

    // Set auth_token cookie with project prefix
    (await cookieStore).set(`${projectName}_auth_token`, "1234567890", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Set branch cookie with project prefix
    (await cookieStore).set(`${projectName}_branch`, branchId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // TODO: Remove this after testing
    /*
    const response = await requestToAuthService("auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error login: ", data);
      if (data.message) {
        return { success: false, error: data.message };
      }
      return { success: false, error: "Something went wrong. Please try again later." };
    }

    if (!data.tokens?.access?.token) {
      console.error("Error login token not found: ", data);
      return { success: false, error: "Something went wrong. Please try again later." };
    }

    const cookieStore = cookies();
    const projectName = process.env.PROJECT_NAME || 'app';

    // Set auth_token cookie with project prefix
    (await cookieStore).set(`${projectName}_auth_token`, data.tokens.access.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Set refresh_token cookie with project prefix
    if (data.tokens?.refresh?.token) {
      (await cookieStore).set(`${projectName}_refresh_token`, data.tokens.refresh.token, {
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
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        business_category: data.user.business_category,
        verified_email: data.user.verified_email,
        company_id: data.user.company_id,
      }),
      {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    // Set the username for access to the service with project prefix (use email as fallback)
    (await cookieStore).set(`${projectName}_username`, data.user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    */

    if (returnUrl) redirect(returnUrl);

    return { success: true };
  } catch (error) {
    console.error("Login error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: "Something went wrong. Please try again later."
    };
  }
}

export async function logout() {
  const cookieStore = cookies();
  const projectName = process.env.PROJECT_NAME || 'app';
  
  (await cookieStore).delete(`${projectName}_auth_token`);
  (await cookieStore).delete(`${projectName}_refresh_token`);
  (await cookieStore).delete(`${projectName}_user`);
  (await cookieStore).delete(`${projectName}_username`);
  (await cookieStore).delete(`${projectName}_branch`);
  redirect("/login");
}