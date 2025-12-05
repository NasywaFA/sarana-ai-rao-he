"use server";

import { requestToServiceFullPathUrl } from "@/helpers/request";
import { CommonResponse } from "@/lib/responses";
import { BranchType } from "@/types/BranchType";
import { cookies } from "next/headers";

interface BranchTypeResponse {
    isSuccess: boolean;
    data: BranchType | null;
    message: string;
}

interface BranchesTypeResponse {
    isSuccess: boolean;
    data: BranchType[];
    message: string;
}

export async function changeBranch(branchId: string): Promise<CommonResponse<string>> {
    const projectName = process.env.PROJECT_NAME;
    const cookieStore = await cookies();
    cookieStore.set(`${projectName}_branch`, branchId);
    return {
        isSuccess: true,
        data: branchId,
        message: 'Branch ID changed'
    }
}

export async function getCurrentBranch(): Promise<CommonResponse<string>> {
    const projectName = process.env.PROJECT_NAME;
    const cookieStore = await cookies();
    const branchId = cookieStore.get(`${projectName}_branch`);

    if (!branchId) {
        return {
            isSuccess: false,
            data: null,
            message: 'Branch ID not found'
        }
    }

    return {
        isSuccess: true,
        data: branchId.value,
        message: 'Branch ID found'
    }
}

export async function getCurrentBranchWithDetails(): Promise<CommonResponse<BranchType>> {
    const branch = await getCurrentBranch();

    if (!branch.isSuccess) {
        return {
            isSuccess: false,
            data: null,
            message: 'Branch ID not found'
        }
    }

    const response = await getBranchById(branch.data!);
    if (!response.isSuccess) {
        return {
            isSuccess: false,
            data: null,
            message: 'Branch details not found'
        }
    }

    return {
        isSuccess: true,
        data: response.data,
        message: 'Branch details found'
    }
}

export async function getBranches(): Promise<BranchesTypeResponse> {
    try {
        let url = `${process.env.BACKEND_SERVICE_URL}v1/branches`;

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

        const json = await response.json();
        return {
            isSuccess: true,
            data: json.data || json.branches || null, // Nullify so that we'll get a fatal error if the data is not found, easier for debugging
            message: json.message
        };
    } catch (error) {
        console.error('Error fetching branches:', error);
        return { isSuccess: false, data: [], message: 'An unexpected error occurred while fetching branches' };
    }
}

export async function getBranchById(branchId: string): Promise<BranchTypeResponse> {
    try {
        let url = `${process.env.BACKEND_SERVICE_URL}v1/branches/${branchId}`;

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
                    data: null,
                    message: jsonStr.message || 'Branch not found'
                };
            }

            console.error('Failed to fetch branch');
            return { isSuccess: false, data: null, message: 'Failed to fetch branch' };
        }

        const json = await response.json();
        return {
            isSuccess: true,
            data: json.data || json.branch || null,
            message: json.message
        };
    } catch (error) {
        console.error('Error fetching branch:', error);
        return { isSuccess: false, data: null, message: 'An unexpected error occurred while fetching branch' };
    }
}

export async function createBranch(data: { name: string; slug: string }): Promise<BranchTypeResponse> {
    try {
        let url = `${process.env.BACKEND_SERVICE_URL}v1/branches`;
        const response = await requestToServiceFullPathUrl(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();
        if (!response.ok) {
            return {
                isSuccess: false,
                data: null,
                message: json.message || 'Failed to create branch',
            };
        }
        return {
            isSuccess: true,
            data: json.data || json.branch || null,
            message: json.message,
        };
    } catch (error) {
        console.error('Error creating branch:', error);
        return { isSuccess: false, data: null, message: 'An unexpected error occurred while creating branch' };
    }
}

export async function updateBranch(branchId: string, data: Partial<BranchType>): Promise<BranchTypeResponse> {
    try {
        let url = `${process.env.BACKEND_SERVICE_URL}v1/branches/${branchId}`;
        const response = await requestToServiceFullPathUrl(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();
        if (!response.ok) {
            return {
                isSuccess: false,
                data: null,
                message: json.message || 'Failed to update branch',
            };
        }
        return {
            isSuccess: true,
            data: json.data || json.branch || null,
            message: json.message,
        };
    } catch (error) {
        console.error('Error updating branch:', error);
        return { isSuccess: false, data: null, message: 'An unexpected error occurred while updating branch' };
    }
}

export async function deleteBranch(branchId: string): Promise<BranchTypeResponse> {
    try {
        let url = `${process.env.BACKEND_SERVICE_URL}v1/branches/${branchId}`;
        const response = await requestToServiceFullPathUrl(url, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const json = await response.json();
        if (!response.ok) {
            return {
                isSuccess: false,
                data: null,
                message: json.message || 'Failed to delete branch',
            };
        }
        return {
            isSuccess: true,
            data: json.data || json.branch || null,
            message: json.message,
        };
    } catch (error) {
        console.error('Error deleting branch:', error);
        return { isSuccess: false, data: null, message: 'An unexpected error occurred while deleting branch' };
    }
}
