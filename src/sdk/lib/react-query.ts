
import { QueryClient as TanstackQueryClient } from '@tanstack/react-query';

export const tanstackQueryClient = new TanstackQueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});
