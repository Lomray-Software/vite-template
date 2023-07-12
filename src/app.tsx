import type { FCC } from '@lomray/client-helpers/interfaces';
import { ConsistentSuspenseProvider, Suspense } from '@lomray/consistent-suspense';
import type { StreamSuspense } from '@lomray/consistent-suspense/server';
import { MetaManagerProvider } from '@lomray/react-head-manager';
import type { Manager as MetaManager } from '@lomray/react-head-manager';
import type { Manager } from '@lomray/react-mobx-manager';
import { StoreManagerProvider } from '@lomray/react-mobx-manager';
import { StrictMode } from 'react';
import Fallback from '@components/fallback';
import '@assets/styles/index.css';

interface IApp {
  client?: {
    storeManager: Manager;
    metaManager: MetaManager;
  };
  server?: IApp['client'] & {
    streamSuspense: StreamSuspense;
  };
}

const App: FCC<IApp> = ({ children, client, server }) => {
  const storeManager = (client?.storeManager ?? server?.storeManager)!;
  const metaManager = (client?.metaManager ?? server?.metaManager)!;

  return (
    <ConsistentSuspenseProvider>
      <StoreManagerProvider storeManager={storeManager}>
        <MetaManagerProvider manager={metaManager}>
          <h1>Welcome to demo app</h1>
          <Suspense fallback={<Fallback />}>{children}</Suspense>
        </MetaManagerProvider>
      </StoreManagerProvider>
    </ConsistentSuspenseProvider>
  );
};

/**
 * Just wrapper to add strict mode
 * @constructor
 */
const AppStrict: FCC<IApp> = (props) => (
  <StrictMode>
    <App {...props} />
  </StrictMode>
);

export default AppStrict;
