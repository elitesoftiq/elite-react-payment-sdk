import httpClient from "@/sdk/lib/http-client";
import type { MakeCredentialOptions, AttestationRequest, WebAuthnCredential } from "@/sdk/types";

export const makeCredentialOptions = async (): Promise<{ data: MakeCredentialOptions }> => {
    const data = {
        'attType': 'none',
        'authType': 'platform',
        'requireResidentKey': false,
        'userVerification': 'required',
    }
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }
    return await httpClient.post('/webauthn/makeCredentialOptions', data, { headers });
}

export const getGetAssertionOptions = async () => {
    return await httpClient.get('/webauthn/getAssertionOptions');
}

export const makeCredential = async (
    pubKeyOptions: MakeCredentialOptions,
    platformRes: WebAuthnCredential,
    otp: string
) => {
    const attestation: AttestationRequest = {
        challengeId: pubKeyOptions.challengeId,
        otp: otp,
        attestationResponse: {
            id: platformRes.id,
            rawId: platformRes.rawId,
            type: "public-key",
            response: {
                clientDataJSON: platformRes.response.clientDataJSON,
                attestationObject: platformRes.response.attestationObject,
            },
        },
    };

    return await httpClient.post('/webauthn/makeCredential', attestation);
}

// Helper function to create WebAuthn credential based on Flutter logic
export const createWebAuthnCredential = async (credentialCreateOptions: any): Promise<WebAuthnCredential> => {
    function normalizeBase64Url(input: string): string {
        // Convert base64url to base64
        let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '=' to make length multiple of 4
        const padding = base64.length % 4;
        if (padding === 2) base64 += '==';
        else if (padding === 3) base64 += '=';
        else if (padding === 1) base64 += '==='; // rare, but normalize defensively
        return base64;
    }

    function base64UrlToUint8Array(input: string): Uint8Array {
        const base64 = normalizeBase64Url(input);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i += 1) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        // Convert base64 to base64url (no padding)
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    // In local development, the RP ID must match the current origin's effective domain.
    // Override rp.id when running on localhost to avoid SecurityError.
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const rpEntity: PublicKeyCredentialRpEntity = {
        ...credentialCreateOptions.rp,
        id: isLocalhost ? hostname : credentialCreateOptions.rp?.id,
        name: credentialCreateOptions.rp?.name ?? hostname,
    };

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64UrlToUint8Array(credentialCreateOptions.challenge),
        rp: rpEntity,
        user: {
            id: base64UrlToUint8Array(credentialCreateOptions.user.id),
            name: credentialCreateOptions.user.name,
            displayName: credentialCreateOptions.user.displayName,
        },
        pubKeyCredParams: credentialCreateOptions.pubKeyCredParams,
        authenticatorSelection: credentialCreateOptions.authenticatorSelection,
        timeout: credentialCreateOptions.timeout,
        excludeCredentials: credentialCreateOptions.excludeCredentials?.map((cred: any) => ({
            type: cred.type,
            id: base64UrlToUint8Array(cred.id),
            transports: cred.transports,
        })) || [],
        attestation: credentialCreateOptions.attestation,
    };

    const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) {
        throw new Error('Failed to create credential');
    }

    const response = credential.response as AuthenticatorAttestationResponse;

    return {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
            clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
            attestationObject: arrayBufferToBase64Url(response.attestationObject),
        },
    };
}