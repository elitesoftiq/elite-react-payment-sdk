interface PaymentSummaryProps {
    amount: number;
    currency: string;
    breakdown?: {
      items?: number;
      discounts?: number;
      serviceFees?: number;
    };
  }
  
const PaymentSummary = ({
    amount,
    currency,
    breakdown,
  }: PaymentSummaryProps) => {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
        <div className="space-y-1 text-sm text-gray-700">
          {breakdown?.items && (
            <div className="flex justify-between">
              <span>Items</span>
              <span>{breakdown.items}</span>
            </div>
          )}
          {breakdown?.discounts && (
            <div className="flex justify-between">
              <span>Discounts</span>
              <span className="text-green-600">- {currency}{breakdown.discounts}</span>
            </div>
          )}
          {breakdown?.serviceFees && (
            <div className="flex justify-between">
              <span>Service Fees</span>
              <span>{currency}{breakdown.serviceFees}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>{currency}{amount}</span>
          </div>
        </div>
      </div>
    );
  };

  export default PaymentSummary;