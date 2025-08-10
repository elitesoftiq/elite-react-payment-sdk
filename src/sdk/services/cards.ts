import httpClient from "@/sdk/lib/http-client";

export const getSavedCards = async () => {
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }
    return await httpClient.get('/api/app/payment-request/verified-tokens', { headers });
};