import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

export const STALE_TIME = 60_000;

export type TGetQueryClient = (args: LoaderFunctionArgs) => QueryClient | Promise<QueryClient>;

let provideBrowserClient: (client: QueryClient) => void;
const browserClientReady = new Promise<QueryClient>((resolve) => {
  provideBrowserClient = resolve;
});

export const setBrowserQueryClient = (client: QueryClient) => provideBrowserClient(client);

// Only the browser uses the shared readiness promise. SSR reads this request's props.
export const getQueryClient: TGetQueryClient = ({ context }) =>
  import.meta.env.SSR ? (context!.appProps.queryClient as QueryClient) : browserClientReady;

// Call per server request, and once from the browser entry's init callback.
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });

export default createQueryClient;
