'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FidoRegistrationProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const FidoRegistration = ({ onChange }: FidoRegistrationProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'email' | 'phone' | null>(null);
  const [skipped, setSkipped] = useState(false);

  if (skipped) {
    return <p className="text-sm text-gray-500 italic">FIDO registration skipped.</p>;
  }

  const handleSkip = () => {
    setSkipped(true);
    onChange(false);
  };

  return (
    <div className="mt-4 space-y-2">
      <label className="block text-sm font-medium text-gray-800">
        FIDO Registration Mode
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`px-3 py-1 rounded-md border ${
            mode === "email" ? "bg-blue-600 text-white" : "bg-white text-black"
          }`}
        >
          {t('email')}
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`px-3 py-1 rounded-md border ${
            mode === "phone" ? "bg-blue-600 text-white" : "bg-white text-black"
          }`}
        >
          {t('phone')}
        </button>
      </div>

      {mode && (
        <p className="text-sm text-gray-600">
          Verification will be based on your {mode === "email" ? "email address." : "phone number."}
        </p>
      )}

      <button
        type="button"
        onClick={handleSkip}
        className="text-xs text-red-500 underline mt-1"
      >
        {t('skipFido')}
      </button>
    </div>
  );
};

export default FidoRegistration;