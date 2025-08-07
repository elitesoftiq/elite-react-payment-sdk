'use client';

import { useState } from 'react';
import PaymentSummary from "./PaymentSummary";
import FidoRegistration from "./FidoRegistration";
import CardSavingToggle from "./CardSavingToggle";
import CardInformation from "./CardInformation";
import type { CardInformation as CardInfoType, PaymentData } from "./types";

interface PaymentModalProps {
  amount: number;
  currency: string;
  onClose: () => void;
  onConfirm: (result: PaymentData) => void;
  breakdown?: {
    items?: number;
    discounts?: number;
    serviceFees?: number;
  };
}

export const PaymentModal = ({
  amount,
  currency,
  onClose,
  onConfirm,
  breakdown,
}: PaymentModalProps) => {
  const [cardInfo, setCardInfo] = useState<CardInfoType>({
    cardHolderName: '',
    cardNumber: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: ''
  });
  const [saveCard, setSaveCard] = useState(false);
  const [fidoRegistration, setFidoRegistration] = useState(false);

  const handleConfirm = () => {
    const paymentData: PaymentData = {
      cardInfo,
      saveCard,
      fidoRegistration
    };
    onConfirm(paymentData);
  };

  const isFormValid = () => {
    return (
      cardInfo.cardHolderName.trim() !== '' &&
      cardInfo.cardNumber.replace(/\s/g, '').length >= 13 &&
      cardInfo.cvv.length >= 3 &&
      cardInfo.expiryMonth !== '' &&
      cardInfo.expiryYear !== ''
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Confirm Your Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          <PaymentSummary amount={amount} currency={currency} breakdown={breakdown} />
          <CardInformation onCardInfoChange={setCardInfo} />
          <CardSavingToggle enabled={saveCard} onChange={setSaveCard} />
          <FidoRegistration enabled={fidoRegistration} onChange={setFidoRegistration} />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isFormValid()}
            className={`px-4 py-2 rounded-lg transition ${
              isFormValid()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Pay
          </button>
        </div>
      </div>
    </div>
  );
};
