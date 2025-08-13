export interface CardInformation {
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface PaymentData {
  cardInfo: CardInformation;
  saveCard?: boolean;
  fidoRegistration?: boolean;
}

export interface SavedCard {
  id: string;
  cardTokenId: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolderName: string;
  isDefault?: boolean;
}

export interface PaymentFlowData {
  amount: string;
  currency: string;
  returnUrl?: string;
  saveCard: boolean;
  cardTokenId?: string;
}

// WebAuthn Types based on Flutter implementation
export interface RelyingParty {
  id: string;
  name: string;
  icon?: string;
}

export interface User {
  id: string;
  name: string;
  displayName: string;
}

export interface CredentialDescriptor {
  type: string;
  id: string;
  transports: string[];
}

export interface PubKeyCredParam {
  type: string;
  alg: number;
}

export interface AuthenticatorSelection {
  requireResidentKey: boolean;
  residentKey: string;
  userVerification: string;
  authenticatorAttachment: string;
}

export interface MakeCredentialOptions {
  challengeId: string;
  credentialCreateOptions: {
    challenge: string;
    rp: RelyingParty;
    user: User;
    pubKeyCredParams: PubKeyCredParam[];
    timeout: number;
    excludeCredentials: CredentialDescriptor[];
    authenticatorSelection: AuthenticatorSelection;
    attestation: string;
  };
}

export interface WebAuthnCredential {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
}

export interface AttestationRequest {
  challengeId: string;
  otp: string;
  attestationResponse: WebAuthnCredential;
}
