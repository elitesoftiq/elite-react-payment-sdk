import httpClient from "@/sdk/lib/http-client";
import type { PaymentFlowData } from "@/sdk/types";

export const createPaymentRequest = async (paymentData: PaymentFlowData) => {
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

    return await httpClient.post('/api/app/payment-request/payment-request', requestData);
};

export const getGatewayOrderData = async (orderId: string) => {
    return await httpClient.post('/api/app/payment-request/payment-status-request', { orderId });
};