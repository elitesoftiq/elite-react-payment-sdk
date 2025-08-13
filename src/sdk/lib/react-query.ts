
import { QueryClient as TanstackQueryClient } from '@tanstack/react-query';
import { toastUtils } from './toast';

export const tanstackQueryClient = new TanstackQueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
        mutations: {
            onError: (err: any) => {
                toastUtils.apiError(err);
            },
        },
    },
});
