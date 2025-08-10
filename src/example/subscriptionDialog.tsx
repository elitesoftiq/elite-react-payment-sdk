import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DrawerDialogDemo } from '@/components/ui/DialogDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShoppingBag } from 'lucide-react';
import { getSubscriptionProducts } from '@/sdk/services/subscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { subscribeToProduct } from '@/sdk/services/subscription';

type SubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  projectId?: string;
};

type SubscriptionProduct = {
  id: string;
  productName?: string;
  description?: string;
  amount?: number;
  currency?: string;
  chargingCycle?: string;
  [key: string]: unknown;
};

const DEFAULT_PROJECT_ID = '3a1b3fa9-9429-7b9c-9dc3-586e128ca8f0';

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  projectId = DEFAULT_PROJECT_ID,
}) => {
  const [currentStep, setCurrentStep] = useState<'products' | 'contact'>('products');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!open) {
      setCurrentStep('products');
      setSelectedProductId(null);
      setContactInfo({ fullName: '', street: '', city: '', state: '', email: '', phone: '' });
    }
  }, [open]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscription-products', projectId],
    queryFn: () => getSubscriptionProducts(projectId),
    enabled: open && !!projectId,
  });

  const products: SubscriptionProduct[] = data?.data?.items ?? [];

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const { mutate: mutateSubscribe, isPending: isSubscribing } = useMutation({
    mutationFn: () =>
      subscribeToProduct({
        productId: selectedProductId as string,
        returnUrl: window.location.origin,
        contactInfo,
      }),
    onSuccess: (response: any) => {
      const paymentForm = response?.data?.paymentForm;
      if (paymentForm) {
        window.location.href = paymentForm;
        return;
      }
      onOpenChange(false);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error('Subscription failed:', error);
    },
  });

  const renderProductsStep = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-6 text-center text-sm text-red-600">
          Failed to load products. Please try again.
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="p-8 text-center space-y-2">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No subscription products found</p>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-4">
        <div className="text-center space-y-1 border-b pb-4">
          <h2 className="text-xl font-semibold">Subscription Products</h2>
          <p className="text-sm text-gray-600">Select a product to proceed</p>
        </div>

        <div className="space-y-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className={`hover:shadow-sm transition-shadow cursor-pointer ${
                selectedProductId === product.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedProductId(product.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium">
                      {product.productName ?? `Product ${product.id}`}
                    </div>
                    {product.description && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-700">
                    {typeof product.amount === 'number' && product.currency ? (
                      <div className="font-semibold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: product.currency,
                        }).format(product.amount)}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4" />
                        Pricing TBD
                      </div>
                    )}
                    {product.chargingCycle && (
                      <div className="text-xs text-gray-500">{product.chargingCycle}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            className="w-full h-12"
            onClick={() => setCurrentStep('contact')}
            disabled={!selectedProductId}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderContactStep = () => {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-1 border-b pb-4">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          {selectedProduct && (
            <p className="text-sm text-gray-600">
              Subscribing to: <span className="font-medium">{selectedProduct.productName ?? selectedProduct.id}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={contactInfo.fullName}
              onChange={(e) => setContactInfo((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo((p) => ({ ...p, email: e.target.value }))}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+1 555 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Region</Label>
            <Input
              id="state"
              value={contactInfo.state}
              onChange={(e) => setContactInfo((p) => ({ ...p, state: e.target.value }))}
              placeholder="CA"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street</Label>
            <Input
              id="street"
              value={contactInfo.street}
              onChange={(e) => setContactInfo((p) => ({ ...p, street: e.target.value }))}
              placeholder="123 Main St"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={contactInfo.city}
              onChange={(e) => setContactInfo((p) => ({ ...p, city: e.target.value }))}
              placeholder="San Francisco"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setCurrentStep('products')}
          >
            Back
          </Button>
          <Button
            type="button"
            className="flex-1"
            variant="default"
            onClick={() => mutateSubscribe()}
            disabled={isSubscribing || !contactInfo.fullName || !contactInfo.email}
          >
            {isSubscribing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DrawerDialogDemo
      title={currentStep === 'products' ? 'Subscription Products' : 'Contact Information'}
      trigger={trigger}
      open={open}
      setOpen={onOpenChange}
      widthClassName="w-[560px] max-w-[95vw] overflow-y-auto"
    >
      {currentStep === 'products' ? renderProductsStep() : renderContactStep()}
    </DrawerDialogDemo>
  );
};

export default SubscriptionDialog;

 