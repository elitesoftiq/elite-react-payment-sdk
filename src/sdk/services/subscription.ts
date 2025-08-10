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
    const headers = {
        "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
    };
  return await httpClient.post('/api/app/subscription/subscribe', {
    productId,
    cardTokenId,
    tenantPaymentProviderId,
    returnUrl,
    contactInfo,
  }, { headers });
};

export const getUserSubscriptions = async () => {
    const headers = {
        "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
    };
    return await httpClient.get(`/api/app/subscription/subscriptions`, { headers });
};

export const cancelSubscription = async (subscriptionId: string) => {
    const headers = {
        "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
    };
    // Using POST for action endpoint consistency
    return await httpClient.post(
        `/api/app/subscription/cancel-subscription/${subscriptionId}`,
        {},
        { headers },
    );
};


export const reEnableSubscription = async (subscriptionId: string) => {
  const headers = {
      "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
  };
  // Using POST for action endpoint consistency
  return await httpClient.post(
      `/api/app/subscription/re-enable-subscription/${subscriptionId}`,
      {},
      { headers },
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
    const headers = {
        "__projectId": "3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0",
    };
  return await httpClient.post('/api/app/subscription/re-subscribe', {
    subscriptionId,
    cardTokenId,
    tenantPaymentProviderId,
    returnUrl,
    contactInfo,
  }, { headers });
};