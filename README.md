## Elite React Payment SDK — Developer Guide

Production-ready React components and helpers to integrate card payments, card-on-file (WebAuthn + OTP), and subscriptions. This README distills the usage from the example in `src/example` into a concise developer guide.

### What’s included

- **Dialogs**: `PaymentDialog`, `SubscriptionDialog`, `UserSubscriptionsDialog`
- **Services**: `paymentInit`, `payment`, `subscription`, `cards`, `passkeyService`
- **Types**: Reusable TypeScript types in `src/sdk/types.ts`
- **Example app**: End-to-end flow in `src/example`

---

## Quickstart

1. Install and run the example

```bash
pnpm i # or npm i / yarn
pnpm dev
```

2. Configure API base URL

Create `.env` with your API base:

```bash
VITE_REACT_APP_API_URL=https://your-api.example.com
```

3. Wrap your app with React Query

```tsx
// src/App.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { tanstackQueryClient } from "./sdk/lib/react-query";

export default function App() {
  return (
    <QueryClientProvider client={tanstackQueryClient}>
      {/* your routes */}
    </QueryClientProvider>
  );
}
```

4. Authenticate and initialize SDK session headers

```ts
// Obtain bearer token using resource-owner password
import {
  paymentLogin,
  getPaymentTokenRequest,
} from "@/sdk/services/paymentInit";
import httpClient from "@/sdk/lib/http-client";

async function initSession({
  username,
  password,
  clientId,
  tenant,
  projectId,
}: {
  username: string;
  password: string;
  clientId: string;
  tenant: string;
  projectId: string;
}) {
  const { data: clientToken } = await paymentLogin(
    { username, password, clientId, projectId },
    tenant
  );
  const { data: gatewayToken } = await getPaymentTokenRequest(
    { clientAccessToken: clientToken.access_token, clientId, projectId },
    tenant
  );
  // Set headers for subsequent SDK requests
  httpClient.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${gatewayToken.access_token}`;
  httpClient.defaults.headers.common["__projectId"] = projectId;
}
```

Once set, dialogs and services can call authenticated endpoints.

---

## Core flows

### 1) One-time payment (saved card or new card)

Component: `src/example/paymentDialog.tsx` exports `PaymentDialog`.

Props:

- `open`: boolean — controlled dialog state
- `onOpenChange(open: boolean)`: state setter
- `returnUrl?`: string — where the gateway redirects after payment

Usage:

```tsx
import { useState } from "react";
import { PaymentDialog } from "@/example/paymentDialog";

export function PayButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Pay</button>
      <PaymentDialog
        open={open}
        onOpenChange={setOpen}
        destination="merchant-123"
        returnUrl={window.location.origin}
      />
    </>
  );
}
```

Behavior:

- On open, loads saved cards via `getSavedCards()`.
- Selecting a saved card immediately builds `PaymentFlowData` and calls `createPaymentRequest()`. If backend returns `paymentForm`, user is redirected.
- Adding a new card triggers `makeCredentialOptions()` → user enters OTP → WebAuthn attestation via `createWebAuthnCredential()` → `makeCredential()` to securely save the card → then `createPaymentRequest()`.

Key service:

```ts
// src/sdk/services/payment.ts
export const createPaymentRequest = async (paymentData: PaymentFlowData) => {
  return httpClient.post("/api/app/payment-request/payment-request", {
    saveCard: paymentData.saveCard,
    returnUrl: paymentData.returnUrl ?? window.location.origin,
    amount: paymentData.amount,
    cardTokenId: paymentData.cardTokenId,
  });
};
```

Check payment result optionally by reading `orderId` from query string and calling `getGatewayOrderData(orderId)`.

### 2) Subscriptions — browse and subscribe

Component: `src/example/subscriptionDialog.tsx` exports `SubscriptionDialog`.

Props:

- `open`, `onOpenChange`
- `trigger`: React node to open the drawer
- `projectId?`: defaults to a sample value; pass your project id

Usage:

```tsx
<SubscriptionDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  trigger={<button>View Subscription Products</button>}
  projectId={yourProjectId}
/>
```

Behavior:

- Loads products via `getSubscriptionProducts(projectId)`.
- On Subscribe, calls `subscribeToProduct({ productId, returnUrl, contactInfo })`. If `paymentForm` is returned, redirects to gateway.

### 3) Subscriptions — list, cancel, re-enable

Component: `src/example/userSubscriptionsDialog.tsx` exports `UserSubscriptionsDialog`.

Props:

- `open`, `onOpenChange`
- `trigger`: React node to open the drawer

Behavior:

- Lists current subscriptions via `getUserSubscriptions()`.
- Users can cancel (`cancelSubscription(id)`) or re-enable (`reEnableSubscription(id)`) a subscription.

---

## Types

```ts
export interface PaymentFlowData {
  amount: string;
  currency: string; // currently optional on server side in example
  returnUrl?: string;
  saveCard: boolean;
  cardTokenId?: string; // present when using saved card
}
```

Additional WebAuthn-related types are in `src/sdk/types.ts`.

---

## Authentication and headers

All SDK requests use a shared Axios instance: `src/sdk/lib/http-client.ts`.

- Base URL: `import.meta.env.VITE_REACT_APP_API_URL`
- Required headers after initialization:
  - `Authorization: Bearer <token>`
  - `__projectId: <your-project-id>`

Token bootstrap sequence (from the example):

1. `paymentLogin({ username, password, clientId, projectId }, tenant)` → returns `access_token` for the client
2. `getPaymentTokenRequest({ clientAccessToken, clientId, projectId }, tenant)` with grant `JwtAssertedExtensionGrant`
3. Set `Authorization` and `__projectId` on `httpClient.defaults.headers.common`

---

## WebAuthn and OTP notes

- New card registration uses OTP + WebAuthn attestation.
- Endpoints used: `makeCredentialOptions`, `makeCredential` in `src/sdk/services/passkeyService.ts`.
- On localhost, RP ID is adjusted automatically to avoid `SecurityError`.
- WebAuthn requires HTTPS in production.

---

## Example: minimal payment flow wiring

```tsx
import { useState } from "react";
import httpClient from "@/sdk/lib/http-client";
import {
  paymentLogin,
  getPaymentTokenRequest,
} from "@/sdk/services/paymentInit";
import { PaymentDialog } from "@/example/paymentDialog";

export function Checkout() {
  const [open, setOpen] = useState(false);

  async function init() {
    const tenant = "your-tenant";
    const projectId = "your-project-id";
    const clientId = "your-client-id";
    const username = "user";
    const password = "pass";

    const { data: clientToken } = await paymentLogin(
      { username, password, clientId, projectId },
      tenant
    );
    const { data: gatewayToken } = await getPaymentTokenRequest(
      { clientAccessToken: clientToken.access_token, clientId, projectId },
      tenant
    );
    httpClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${gatewayToken.access_token}`;
    httpClient.defaults.headers.common["__projectId"] = projectId;
    setOpen(true);
  }

  return (
    <>
      <button onClick={init}>Pay now</button>
      <PaymentDialog
        open={open}
        onOpenChange={setOpen}
        returnUrl={window.location.origin}
      />
    </>
  );
}
```

---

## API surface summary

- Payments: `createPaymentRequest(paymentData)`, `getGatewayOrderData(orderId)`
- Cards: `getSavedCards()`
- Auth: `paymentLogin(data, tenant)`, `getPaymentTokenRequest(data, tenant)`
- Subscriptions: `getSubscriptionProducts(projectId)`, `subscribeToProduct(...)`, `getUserSubscriptions()`, `cancelSubscription(id)`, `reEnableSubscription(id)`, `reSubscribeToProduct(...)`

All functions return Axios promises shaped as `{ data: ... }`.

---

## Running the example app

```bash
pnpm i
pnpm dev
# open http://localhost:5173
```

The example route renders `PaymentTestForm` from `src/example/index.tsx`, with buttons to:

- Initialize and open `PaymentDialog`
- Open `SubscriptionDialog`
- Open `UserSubscriptionsDialog`
- Show payment status if `?orderId=<id>` is present

---

## Styling and UI

The example uses local UI components in `src/components/ui` (shadcn-style). You can:

- Reuse them, or
- Replace with your design system while keeping service calls and dialog logic.

---

## i18n and `WebPaymentSDK`

`src/sdk/index.tsx` contains a minimal `WebPaymentSDK` placeholder with i18n setup. Dialogs demonstrated in `src/example` are the primary integration surface today.

---

## Support

If you run into issues integrating, start from the example components in `src/example` and adapt to your app. Ensure `VITE_REACT_APP_API_URL` is set and request headers are initialized after login.
