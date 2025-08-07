import { PaymentModal } from "./PaymentModal";
import { I18nextProvider } from "react-i18next";
import i18n from "./locale/i18n";
import type { PaymentData } from "./types";

export const WebPaymentSDK = ({
  config
}: {
  config: {
    mode: "fullscreen" | "popup";
    language?: "en" | "ar";
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
    };
    onComplete: (result: PaymentData) => void;
    onClose: () => void;
    paymentInfo: {
      total: number;
      breakdown?: { items: number; discount?: number };
    };
    fidoIdentifier?: string;
  };
}) => {

  return (
    <div
      className="font-sdk"
    >
      <I18nextProvider i18n={i18n}>
        <PaymentModal
          amount={config.paymentInfo.total}
          currency="USD"
          onClose={config.onClose}
          onConfirm={config.onComplete}
          breakdown={config.paymentInfo.breakdown}
        />
      </I18nextProvider>
    </div>
  );
};

// Export individual components
export { PaymentModal } from "./PaymentModal";
export { default as PaymentSummary } from "./PaymentSummary";
export { default as CardSavingToggle } from "./CardSavingToggle";
export { default as FidoRegistration } from "./FidoRegistration";
export { default as CardInformation } from "./CardInformation";
export { default as I18nProvider } from "./locale/i18n";
export type { CardInformation as CardInformationType, PaymentData } from "./types";
