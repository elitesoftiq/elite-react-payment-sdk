import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const toastUtils = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, options);
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, options);
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },

  // Utility for handling API errors
  apiError: (error: any) => {
    const message = error?.response?.data?.message || 
                   error?.message || 
                   'An unexpected error occurred';
    return toast.error(message);
  },

  // Utility for payment success
  paymentSuccess: (message = 'Payment processed successfully') => {
    return toast.success(message, { duration: 3000 });
  },

  // Utility for authentication success
  authSuccess: (message = 'Authentication successful') => {
    return toast.success(message, { duration: 2000 });
  },

  // Utility for subscription actions
  subscriptionSuccess: (action: 'subscribed' | 'cancelled' | 're-enabled') => {
    const messages = {
      subscribed: 'Successfully subscribed to product',
      cancelled: 'Subscription cancelled successfully',
      're-enabled': 'Subscription re-enabled successfully'
    };
    return toast.success(messages[action], { duration: 3000 });
  },
};

export default toastUtils;
