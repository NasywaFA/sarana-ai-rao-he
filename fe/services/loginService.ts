"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginResponse } from "../types/Auth";

export async function login(
  email: string,
  password: string,
  branchId: string,
  returnUrl?: string
): Promise<{ success: boolean; data?: LoginResponse; error?: string }>  {
  try {
    const backendUrl = process.env.BACKEND_SERVICE_URL;
    const projectName = process.env.PROJECT_NAME || 'app';

    const response = await fetch(`${backendUrl}v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, branch_id: branchId }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      return { success: false, error: data?.tokens ? undefined : "Invalid email or password" };
    }

    const cookieStore = cookies();

    // Set auth_token cookie with project prefix
    (await cookieStore).set(`${projectName}_auth_token`, data.tokens.access.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    (await cookieStore).set(`${projectName}_refresh_token`, data.tokens.refresh.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    (await cookieStore).set(`${projectName}_user`, JSON.stringify(data.user), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Set branch cookie with project prefix
    if (data.active_branch) {
      (await cookieStore).set(`${projectName}_branch`, JSON.stringify(data.active_branch), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    if (returnUrl) redirect(returnUrl);

    return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Something went wrong. Please try again later." };
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