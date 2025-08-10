import httpClient from "../lib/http-client";

export const getSubscriptionProducts = async (projectId: string) => {

    return await httpClient.get(`/api/app/subscription/products/${projectId}`);
};


export const subscribeToProduct = async ({
  productId,
  cardTokenId,
  tenantPaymentProviderId,
  returnUrl,
  contactInfo,
}: {
  productId: string;
  cardTokenId?: string;
  tenantPaymentProviderId?: string;
  returnUrl: string;
  contactInfo: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    email: string;
    phone: string;
  };
}) => {
  return await httpClient.post('/api/app/subscription/subscribe', {
    productId,
    cardTokenId,
    tenantPaymentProviderId,
    returnUrl,
    contactInfo,
  });
};

export const getUserSubscriptions = async () => {
    return await httpClient.get(`/api/app/subscription/subscriptions`);
};

export const cancelSubscription = async (subscriptionId: string) => {
    // Using POST for action endpoint consistency
    return await httpClient.post(
        `/api/app/subscription/cancel-subscription/${subscriptionId}`,
        {},
    );
};


export const reEnableSubscription = async (subscriptionId: string) => {
  // Using POST for action endpoint consistency
  return await httpClient.post(
      `/api/app/subscription/re-enable-subscription/${subscriptionId}`,
      {},
  );
};



export const reSubscribeToProduct = async ({
  subscriptionId,
  cardTokenId,
  tenantPaymentProviderId,
  returnUrl,
  contactInfo,
}: {
  subscriptionId: string;
  cardTokenId?: string;
  tenantPaymentProviderId?: string;
  returnUrl: string;
  contactInfo: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    email: string;
    phone: string;
  };
}) => {
  return await httpClient.post('/api/app/subscription/re-subscribe', {
    subscriptionId,
    cardTokenId,
    tenantPaymentProviderId,
    returnUrl,
    contactInfo,
  });
};