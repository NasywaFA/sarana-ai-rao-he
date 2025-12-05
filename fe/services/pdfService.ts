"use server"
import { requestToService } from "../helpers/request";


export async function bulkDownloadPdfData(ids: string[], type: "protected" | "unprotected"){
    try {
        const requestBody = {
            ids,
            type,
        }
        const response = await requestToService(`v1/pdf/bulk-download`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            if (response.status === 404) {
                const jsonStr = await response.json();
                return {status: 'error', message: jsonStr.message};
            }

            console.error('Failed to bulk download PDF');
            return {status: 'error', message: 'Failed to bulk download PDF'};
        }

        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        console.error('Error bulk downloading PDF:', error);
        return {status: 'error', message: 'An unexpected error occurred while bulk downloading PDF'};
    }
}

export async function getPdfData(page: number = 1, limit: number = 10){
    try {
        const response = await requestToService(`v1/pdf?page=${page}&limit=${limit}`, {
            method: "GET",
        });
        
        if (!response.ok) {
            console.error('Failed to fetch PDF data');
            return {status: 'error', message: 'Failed to fetch PDF data'};
        }
        
        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        console.error('Error fetching PDF data:', error);
        return {status: 'error', message: 'An unexpected error occurred while fetching PDF data'};
    }
}

export async function getPdfDetailData(id: string) {
    try {
        const response = await requestToService(`v1/pdf/${id}`, {
            method: "GET",
        });
        
        if (!response.ok) {
            console.error("Failed to fetch PDF Detail data");
            return {status: 'error', message: 'Failed to fetch PDF data'};
        }
        
        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        throw new Error('An unexpected error occurred while fetching PDF detail');
    }
}

export async function addPdfData(data: FormData) {
    try {
        console.info(data);
        const response = await requestToService(`v1/pdf`, {
            method: "POST",
            body: data,
        });
        
        if (response.status !== 201) {
            console.error('Failed to upload PDF');
            return {status: 'error', message: 'Failed to upload PDF'};
        }
        
        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        return {status: 'error', message: 'An unexpected error occurred while adding PDF'};
    }
}

export async function deletePdfData(id: string) {
    try {
        const response = await requestToService(`v1/pdf/${id}`, {
            method: "DELETE",
        });
        
        if (!response.ok) {
            console.error('Failed to delete PDF');
            return {status: 'error', message: 'Failed to delete PDF'};
        }

        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        console.error('Error deleting PDF:', error);
        return {status: 'error', message: 'An unexpected error occurred while deleting PDF'};
    }
}

export async function protectPdfData(id: string, data: { password: string }) {
    try {
        const response = await requestToService(`v1/pdf/${id}/protect`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            console.error('Failed to protect PDF');
            return {status: 'error', message: 'Failed to protect PDF'};
        }
        
        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        console.error('Error protecting PDF:', error);
        return {status: 'error', message: 'An unexpected error occurred while protecting PDF'};
    }
}

export async function protectAndExtractPdfData(id: string) {
    try {
        const response = await requestToService(`v1/pdf/${id}/protect-extract-patient-data`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            console.error('Failed to protect and extract PDF data');
            return {status: 'error', message: 'Failed to protect and extract PDF data'};
        }
        
        const jsonStr = await response.json();
        return jsonStr;
    } catch (error) {
        console.error('Error protecting and extracting PDF data:', error);
        return {status: 'error', message: 'An unexpected error occurred while protecting and extracting PDF data'};
    }
}


