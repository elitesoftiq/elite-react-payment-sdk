import httpClient from '@/sdk/lib/http-client';

export const paymentLogin = async (data: any, tenant: string) => {
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "__tenant": tenant,
    }
    // Create properly formatted URL-encoded body
    const body = new URLSearchParams({
        "grant_type": "password",
        "username": data.username,
        "password": data.password,
        "client_id": data.clientId,
        projectId: data.projectId,
        scope: "openid profile email roles offline_access PaymentSdk",
    });
    
    return await httpClient.post('/connect/token', body, { headers });
};

export const getPaymentTokenRequest = async (data: any, tenant: string) => {
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "__tenant": tenant,
    }
    // Create properly formatted URL-encoded body
    const body = new URLSearchParams({
        "token": data.clientAccessToken,
        "client_id": data.clientId,
        "grant_type": "JwtAssertedExtensionGrant",
        projectId: data.projectId,
        scope: "openid profile email roles offline_access PaymentSdk",
    });
    
    return await httpClient.post('/connect/token', body, { headers });
};