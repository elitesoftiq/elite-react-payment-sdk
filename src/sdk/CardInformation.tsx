'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CardInformation as CardInfoType } from './types';

interface CardInformationProps {
  onCardInfoChange: (cardInfo: CardInfoType) => void;
}

export const CardInformation = ({ onCardInfoChange }: CardInformationProps) => {
  const { t } = useTranslation();
  const [cardInfo, setCardInfo] = useState<CardInfoType>({
    cardHolderName: '',
    cardNumber: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: ''
  });

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add space every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleInputChange = (field: keyof CardInfoType, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    } else if (field === 'expiryMonth') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 2);
      if (parseInt(formattedValue) > 12) formattedValue = '12';
    } else if (field === 'expiryYear') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 2);
    }

    const updatedCardInfo = { ...cardInfo, [field]: formattedValue };
    setCardInfo(updatedCardInfo);
    onCardInfoChange(updatedCardInfo);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t('cardInformation')}</h3>
      
      <div>
        <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('cardHolderName')}
        </label>
        <input
          type="text"
          id="cardHolderName"
          value={cardInfo.cardHolderName}
          onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
          placeholder={t('cardHolderNamePlaceholder')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
          {t('cardNumber')}
        </label>
        <input
          type="text"
          id="cardNumber"
          value={cardInfo.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
          placeholder="1234 5678 9012 3456"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
            {t('expiryMonth')}
          </label>
          <input
            type="text"
            id="expiryMonth"
            value={cardInfo.expiryMonth}
            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
            placeholder="MM"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        
        <div>
          <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
            {t('expiryYear')}
          </label>
          <input
            type="text"
            id="expiryYear"
            value={cardInfo.expiryYear}
            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
            placeholder="YY"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
            {t('cvv')}
          </label>
          <input
            type="text"
            id="cvv"
            value={cardInfo.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            placeholder="123"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
};

export default CardInformation;