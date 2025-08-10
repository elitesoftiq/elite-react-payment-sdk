import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DrawerDialogDemo } from '@/components/ui/DialogDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { cancelSubscription, getUserSubscriptions, reEnableSubscription } from '@/sdk/services/subscription';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type UserSubscriptionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
};

type TenantProject = {
  id: string;
  name: string;
};

type TenantProduct = {
  id: string;
  productName: string;
  productCode: string;
  chargingCycle: string;
};

type ContactInfo = {
  fullName: string;
  street: string;
  city: string;
  state: string;
  email: string;
  phone: string;
};

type UserSubscription = {
  id: string;
  creationTime: string;
  tenantProject: TenantProject;
  tenantProduct: TenantProduct;
  currentStatus: string;
  startsAt?: string;
  expiresAt?: string;
  lastRenewedAt?: string;
  nextBillingAt?: string;
  gracePeriod?: string;
  gracePeriodEndsAt?: string;
  contactInfo?: ContactInfo;
};

export const UserSubscriptionsDialog: React.FC<UserSubscriptionsDialogProps> = ({
  open,
  onOpenChange,
  trigger,
}) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: getUserSubscriptions,
    enabled: open,
  });

  const items: UserSubscription[] = data?.data?.items ?? [];

  const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString() : '-';

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedSubscription, setSelectedSubscription] = React.useState<UserSubscription | null>(null);

  const { mutate: mutateCancel, isPending: isCancelling } = useMutation({
    mutationFn: async (id: string) => cancelSubscription(id),
    onSuccess: async () => {
      setConfirmOpen(false);
      setSelectedSubscription(null);
      await queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });

  const { mutate: mutateReEnable, isPending: isReEnabling } = useMutation({
    mutationFn: async (sub: any) => reEnableSubscription(sub),
    onSuccess: async () => {
      setConfirmOpen(false);
      setSelectedSubscription(null);
      await queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });

  const openConfirm = (sub: UserSubscription) => {
    setSelectedSubscription(sub);
    setConfirmOpen(true);
  };

  const renderContent = () => {
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
          Failed to load subscriptions. Please try again.
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="p-8 text-center text-gray-500">No subscriptions found</div>
      );
    }

    return (
      <div className="p-4 space-y-3">
        {items.map((sub) => (
          <Card key={sub.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="text-sm text-gray-500">
                    {sub.tenantProject?.name || 'Project'}
                  </div>
                  <div className="font-medium">
                    {sub.tenantProduct?.productName || 'Subscription'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {sub.tenantProduct?.productCode}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-sm">
                    {sub.tenantProduct?.chargingCycle}
                  </div>
                  <div className="text-xs mt-1 inline-flex items-center gap-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {sub.currentStatus}
                  </div>
                  <div>
                    {sub.nextBillingAt ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirm(sub)}
                    >
                      Cancel subscription
                    </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => mutateReEnable(sub.id)}
                        disabled={isReEnabling}
                      >
                        Re-Enable
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs text-gray-600">
                <div>
                  <div className="text-gray-500">Starts</div>
                  <div>{formatDateTime(sub.startsAt)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Expires</div>
                  <div>{formatDateTime(sub.expiresAt)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Last Renewed</div>
                  <div>{formatDateTime(sub.lastRenewedAt)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Next Billing</div>
                  <div>{formatDateTime(sub.nextBillingAt)}</div>
                </div>
              </div>

              {sub.contactInfo?.email && (
                <div className="mt-3 text-xs text-gray-600">
                  <span className="text-gray-500">Email:</span> {sub.contactInfo.email}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DrawerDialogDemo
      title="My Subscriptions"
      trigger={trigger}
      open={open}
      setOpen={onOpenChange}
      widthClassName="w-[560px] max-w-[95vw] overflow-y-auto"
    >
      {renderContent()}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent aria-describedby="" className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription>
              This will cancel the subscription
              {selectedSubscription?.tenantProduct?.productName ? `: ${selectedSubscription.tenantProduct.productName}` : ''}.
              You can re-subscribe later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isCancelling}
            >
              Keep subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSubscription && mutateCancel(selectedSubscription.id)}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling…' : 'Confirm cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DrawerDialogDemo>
  );
};

export default UserSubscriptionsDialog;

