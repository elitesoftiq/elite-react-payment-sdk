import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createWebAuthnCredential, makeCredential } from '@/sdk/services/passkeyService';
import type { MakeCredentialOptions, WebAuthnCredential } from '@/sdk/types';

interface OtpVerificationProps {
  onSuccess: () => void;
  onBack: () => void;
  credentialOptions: MakeCredentialOptions | null;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ onSuccess, onBack, credentialOptions }) => {
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'otp' | 'webauthn'>('otp');


  const { mutate: submitCredential, isPending: isSubmittingCredential } = useMutation({
    mutationFn: async ({ webAuthnCredential }: { webAuthnCredential: WebAuthnCredential }) => {
      if (!credentialOptions) throw new Error('No credential options available');
      return makeCredential(credentialOptions, webAuthnCredential, otp);
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error('Failed to submit credential:', error);
    },
  });

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !credentialOptions) return;
    setStep('webauthn');
  };

  const handleWebAuthnRegistration = async () => {
    if (!credentialOptions) return;
    
    try {
      const webAuthnCredential = await createWebAuthnCredential(
        credentialOptions.credentialCreateOptions
      );
      submitCredential({ webAuthnCredential });
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
    }
  };

  if (step === 'webauthn') {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold">Secure Your Card</h2>
          <p className="text-gray-600">
            Use your device's biometric authentication to securely save your card information.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleWebAuthnRegistration}
            disabled={isSubmittingCredential}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isSubmittingCredential ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Securing Card...
              </>
            ) : (
              'Authenticate with Biometrics'
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSubmittingCredential}
            className="w-full"
          >
            Back to OTP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Verify Your Identity</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to your registered number. Please enter it below.
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={otp.length !== 6 || !credentialOptions}
            className="w-full"
            size="lg"
            variant={"secondary"}
          >
            Verify OTP
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            Back to Payment
          </Button>
        </div>
      </form>
    </div>
  );
};