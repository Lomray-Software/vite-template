import { MetaManagerProvider } from '@lomray/react-head-manager';
import type { Manager as MetaManager } from '@lomray/react-head-manager';
import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import '@assets/styles/index.css';

interface IAppServices {
  metaManager: MetaManager;
  queryClient: QueryClient;
}

interface IApp {
  client?: IAppServices;
  server?: IApp['client'];
}

const App: FC<PropsWithChildren<IApp>> = ({ children, client, server }) => (
  <StrictMode>
    <MetaManagerProvider manager={(client?.metaManager ?? server?.metaManager)!}>
      <QueryClientProvider client={(client?.queryClient ?? server?.queryClient)!}>
        {children}
      </QueryClientProvider>
    </MetaManagerProvider>
  </StrictMode>
);

export default App;
