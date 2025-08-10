import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import {z} from 'zod';
import { Loader2, RefreshCw, CreditCard, AlertCircle, CheckCircle, Wallet } from 'lucide-react';

import { getPaymentTokenRequest, paymentLogin } from '../sdk/services/paymentInit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import httpClient from '@/sdk/lib/http-client';
// import { PaymentDialog } from './paymentDialog';
import { SubscriptionDialog } from './subscriptionDialog';
import { UserSubscriptionsDialog } from './userSubscriptionsDialog';
import { getGatewayOrderData } from '@/sdk/services/payment';
import { PaymentDialog } from './paymentDialog';

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  clientId: z.string().min(1, { message: "Client ID is required" }),
  tenant: z.string().min(1, { message: "Tenant is required" }),
  projectId: z.string().min(1, { message: "Project ID is required" }),
});

type PaymentTestFormData = z.infer<typeof formSchema>;


export const PaymentTestForm: React.FC = () => {
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
    const [nextDialog, setNextDialog] = useState<'payment' | 'subscription' | null>(null);
    const [isUserSubscriptionsDialogOpen, setIsUserSubscriptionsDialogOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    const {data: gatewayOrderData, fetchStatus, isError: isErrorGatewayOrderData} = useQuery({
        queryKey: ['gatewayOrderData', orderId],
        queryFn: () => getGatewayOrderData(orderId ?? ''),
        enabled: !!orderId,
    });

    const {mutate: mutateGetPaymentTokenRequest} = useMutation({
        mutationFn: (data: any) => getPaymentTokenRequest(data, data.tenant),
        onSuccess: (data: any) => {
            httpClient.defaults.headers.common['Authorization'] = `Bearer ${data.data.access_token}`;
            httpClient.defaults.headers.common['__projectId'] = form.watch('projectId');
            if (nextDialog === 'subscription') {
              setIsSubscriptionDialogOpen(true);
            }
            if (nextDialog === 'payment') {
              setIsPaymentDialogOpen(true);
            }
        },
        onError: (error) => {
            console.log(error);
        },
    });

  const form = useForm<PaymentTestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      clientId: '',
      tenant: '',
      projectId: '',
    },
  });
  const { mutate, isPending, error, data  } = useMutation({
      mutationFn: (values: PaymentTestFormData) => paymentLogin(values, values.tenant),
      onSuccess: (data: any) => {
          mutateGetPaymentTokenRequest({clientAccessToken: data.data.access_token, clientId: form.watch('clientId'), tenant: form.watch('tenant')});
      },
      onError: (error) => {
          console.log(error);
      },
  });

  const onSubmit = async (values: PaymentTestFormData) => {
    setNextDialog('payment');
    mutate(values);
  };

  const resetForm = () => {
    form.reset();
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl">Payment SDK Test Form</CardTitle>
            <CardDescription className="text-lg">
              Test the payment initialization with sample data
            </CardDescription>
          </CardHeader>
        </Card>

        {fetchStatus === 'fetching' && (
          <div className="flex justify-center items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking payment status...
          </div>
        )}
        {isErrorGatewayOrderData && (
          <div className="flex justify-center items-center">
            <AlertCircle className="h-4 w-4 animate-spin" />
            Error checking payment status: {gatewayOrderData?.data?.message}
          </div>
        )}
        {gatewayOrderData?.data?.orderStatus === 'Deposited' && (
          <div className="flex justify-center items-center">
            <CheckCircle className="h-4 w-4 animate-spin" />
            Payment successful
          </div>
        )}

        {/* Main Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Fill in the form with your test credentials and payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Authentication Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Authentication</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Client Configuration Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Client Configuration</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter client ID" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your application's client identifier
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tenant</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tenant" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your organization's tenant identifier
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project ID" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>


                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-6 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { setNextDialog('payment'); mutate(form.getValues()); }}
                    disabled={isPending}
                    className="flex-1"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing Payment...
                      </>
                    ) : (
                      'Test Payment Initialization'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { setNextDialog('subscription'); mutate(form.getValues()); }}
                    disabled={isPending}
                    className="flex-1"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing Initialization...
                      </>
                    ) : (
                      'Test Initialize Subscription'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    disabled={isPending}
                    className="flex-shrink-0"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Form
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>

                {/* Payment Dialog Button */}
                <div className="border-t pt-6">
                    <PaymentDialog
                      open={isPaymentDialogOpen}
                      onOpenChange={setIsPaymentDialogOpen}
                    />
                </div>

                {/* Subscription Dialog Button */}
                <div className="border-t pt-6">
                    <SubscriptionDialog
                      open={isSubscriptionDialogOpen}
                      onOpenChange={setIsSubscriptionDialogOpen}
                      trigger={
                        <Button 
                          type="button" 
                          className="w-full h-12 text-lg"
                        >
                          View Subscription Products
                        </Button>
                      }
                    />
                </div>
                {/* User Subscriptions Dialog Button */}
                <div className="pt-3">
                  <UserSubscriptionsDialog
                    open={isUserSubscriptionsDialogOpen}
                    onOpenChange={setIsUserSubscriptionsDialogOpen}
                    trigger={
                      <Button
                        type="button"
                        className="w-full h-12 text-lg"
                      >
                        View My Subscriptions
                      </Button>
                    }
                  />
                </div>
        {/* Results Section */}
        {(data || error) && (
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
              <CardDescription>API response from payment initialization</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <h4 className="font-medium text-destructive">Error</h4>
                  <p className="mt-2 text-sm text-destructive">{error.message}</p>
                </div>
              )}

              {data && (
                <div className="rounded-lg border border-green-500 bg-green-50 p-4">
                  <h4 className="font-medium text-green-800">Success</h4>
                  <pre className="mt-2 max-h-64 overflow-auto rounded bg-green-100 p-3 text-xs text-green-700">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Fill in the form with your test credentials and payment details</li>
              <li>• The form includes sample data to get you started quickly</li>
              <li>• Amount should be in the smallest currency unit (e.g., cents for USD)</li>
              <li>• Check the response section above for API results</li>
              <li>• Use the reset button to restore default values</li>
              <li>• Form validation will guide you through any missing or invalid fields</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentTestForm;