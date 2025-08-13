import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DrawerDialogDemo } from '@/components/ui/DialogDrawer';
import { Plus, CreditCard, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSavedCards } from '@/sdk/services/cards';
import { createPaymentRequest } from '@/sdk/services/payment';
import { OtpVerification } from '@/sdk/components/OtpVerification';
import type { SavedCard, PaymentFlowData } from '@/sdk/types';
import { makeCredentialOptions } from '@/sdk/services/passkeyService';
import type { MakeCredentialOptions } from '@/sdk/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
type PaymentStep = 'card-selection' | 'otp-verification' | 'success';
const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "IQD", label: "IQD - Iraqi Dinar" },
];


 const formSchema = z.object({
  amount: z.string().min(0.01, { message: "Amount must be greater than 0" }),
  currency: z.string().min(1, { message: "Currency is required" }),
 });

 type PaymentDialogFormData = z.infer<typeof formSchema>;
interface PaymentDialogProps {
  destination?: string;
  returnUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  destination,
  returnUrl,
  open,
  onOpenChange,
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('card-selection');
  const [credentialOptions, setCredentialOptions] = useState<MakeCredentialOptions | null>(null);
  const form = useForm<PaymentDialogFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      currency: '',
    },
  });
  useEffect(() => {
    if (!open) {
      setCurrentStep('card-selection');
      setCredentialOptions(null);
    }
  }, [open]);

  // Fetch saved cards
  const { data: savedCardsResponse, isLoading: isLoadingCards } = useQuery({
    queryKey: ['saved-cards'],
    queryFn: getSavedCards,
    enabled: open,
  });

  const savedCards = savedCardsResponse?.data || [];

  // Get credential options for new card registration
  const { mutate: mutateMakeCredentialOptions, isPending: isSendingOtp } = useMutation({
    mutationFn: makeCredentialOptions,
    onSuccess: (data: { data: MakeCredentialOptions }) => {
      setCredentialOptions(data.data);
      setCurrentStep('otp-verification');
    },
    onError: (error) => {
      console.error('Failed to get credential options:', error);
    },
  });

  // Create payment request
  const { mutate: processPayment, isPending: isProcessingPayment } = useMutation({
    mutationFn: (paymentData: PaymentFlowData) => createPaymentRequest(paymentData),
    onSuccess: (response) => {
      // Redirect to payment gateway
      if (response.data?.paymentForm) {
        window.location.href = response.data.paymentForm;
      }
    },
    onError: (error) => {
      console.error('Payment failed:', error);
    },
  });

  const handleAddNewCard = () => {
    mutateMakeCredentialOptions();
  };

  const handleCardSelect = (card: SavedCard) => {
    const paymentData: PaymentFlowData = {
      amount: form.watch('amount'),
      currency: form.watch('currency'),
      returnUrl,
      saveCard: false,
      cardTokenId: card.cardTokenId,
    };
    processPayment(paymentData);
  };

  const handleOtpSuccess = () => {
    const paymentData: PaymentFlowData = {
      amount: form.watch('amount'),
      currency: form.watch('currency'),
      returnUrl,
      saveCard: true,
    };
    processPayment(paymentData);
  };

  const handleBack = () => {
    setCurrentStep('card-selection');
  };

  const formatAmount = (amount: string, currency: string) => {

    const numAmount = parseFloat(amount);
    
    // Validate currency - use IQD as fallback if currency is empty or invalid
    const validCurrency = currency && currency.trim() !== '' ? currency : 'IQD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: validCurrency,
      }).format(numAmount);
    } catch (error) {
      // Fallback to IQD if the provided currency is invalid
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'IQD',
      }).format(numAmount);
    }
  };

  const renderCardSelection = () => (
    <div className="p-6 space-y-6">
      {/* Payment Summary */}
      <div className="text-center space-y-2 border-b pb-6">
        <h2 className="text-2xl font-semibold">Payment Summary</h2>
        <div className="text-3xl font-bold text-blue-600">
          {form.watch('amount') && form.watch('currency') && formatAmount(form.watch('amount'), form.watch('currency'))}
        </div>
        <p className="text-gray-600">Select a payment method to continue</p>
      </div>

                {/* Payment Information Section */}
            <Form {...form}>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Enter amount"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormDescription>
                            Payment amount in the selected currency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.value} value={currency.value}>
                                  {currency.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Currency for the payment transaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div></Form>

      {/* Add New Card Button */}
      <Button
        onClick={handleAddNewCard}
        disabled={isSendingOtp}
        className="w-full h-14 text-left justify-start"
        variant="outline"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            {isSendingOtp ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <Plus className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">Add New Card</div>
            <div className="text-sm text-gray-500">Register a new payment method</div>
          </div>
        </div>
      </Button>

      {/* Saved Cards */}
      {isLoadingCards ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : savedCards.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Saved Cards</h3>
          {savedCards.map((card: SavedCard) => (
            <Card
              key={card.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardSelect(card)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      •••• •••• •••• {card.last4}
                    </div>
                    <div className="text-sm text-gray-500">
                      {card.brand} • {card.expiryMonth}/{card.expiryYear}
                    </div>
                  </div>
                  {card.isDefault && (
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Default
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No saved cards found</p>
          <p className="text-sm text-gray-400">Add a new card to get started</p>
        </div>
      )}

      {/* Processing Payment State */}
      {isProcessingPayment && (
        <div className="text-center py-4 space-y-2">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Processing payment...</p>
        </div>
      )}
    </div>
  );

  const getDialogContent = () => {
    switch (currentStep) {
      case 'otp-verification':
        return (
          <OtpVerification 
            onSuccess={handleOtpSuccess} 
            onBack={handleBack}
            credentialOptions={credentialOptions}
          />
        );
      case 'card-selection':
      default:
        return renderCardSelection();
    }
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case 'otp-verification':
        return 'Verify Your Identity';
      case 'card-selection':
      default:
        return 'Payment Methods';
    }
  };

  return (
    <DrawerDialogDemo
      title={getDialogTitle()}
      open={open}
      setOpen={onOpenChange}
      widthClassName="w-[400px] max-w-[90vw] overflow-y-auto"
    >
      {getDialogContent()}
    </DrawerDialogDemo>
  );
};
