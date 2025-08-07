import httpClient from "@/sdk/lib/http-client";

export const getSavedCards = async () => {
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
    }
    return await httpClient.get('/api/app/payment-request/verified-tokens', { headers });
};