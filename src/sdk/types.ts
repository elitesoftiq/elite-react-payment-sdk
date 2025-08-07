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
