
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
      </I18nextProvider>
    </div>
  );
};
