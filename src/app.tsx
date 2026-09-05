import { MetaManagerProvider } from '@lomray/react-head-manager';
import type { Manager as MetaManager } from '@lomray/react-head-manager';
import type { FC, PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import '@assets/styles/index.css';

interface IApp {
  client?: { metaManager: MetaManager };
  server?: IApp['client'];
}

const App: FC<PropsWithChildren<IApp>> = ({ children, client, server }) => (
  <StrictMode>
    <MetaManagerProvider manager={(client?.metaManager ?? server?.metaManager)!}>
      {children}
    </MetaManagerProvider>
  </StrictMode>
);

export default App;
