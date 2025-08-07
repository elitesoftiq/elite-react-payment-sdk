import httpClient from "@/sdk/lib/http-client";
import type { PaymentFlowData } from "@/sdk/types";

export const createPaymentRequest = async (paymentData: PaymentFlowData) => {
    const headers = {
        "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
    };

    const defaultReturnUrl = window.location.origin;

    const requestData = {
        saveCard: paymentData.saveCard,
        returnUrl: paymentData.returnUrl ?? defaultReturnUrl,
        amount: paymentData.amount,
        // TODO: Uncomment when currency is implemented
        // currency: paymentData.currency,
        destination: paymentData.destination,
        cardTokenId: paymentData.cardTokenId,
    };

    return await httpClient.post('/api/app/payment-request/payment-request', requestData, { headers });
};

export const getGatewayOrderData = async (orderId: string) => {
    const headers = {
        "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
    };

    return await httpClient.post('/api/app/payment-request/payment-status-request', { orderId }, { headers });
};