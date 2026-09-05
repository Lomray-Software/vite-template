import { MetaManagerProvider } from '@lomray/react-head-manager';
import type { Manager as MetaManager } from '@lomray/react-head-manager';
import type { i18n } from 'i18next';
import type { FC, PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { I18nextProvider } from 'react-i18next';
import '@assets/styles/index.css';

interface IApp {
  client?: { metaManager: MetaManager; localization: i18n };
  server?: IApp['client'];
}

const App: FC<PropsWithChildren<IApp>> = ({ children, client, server }) => (
  <StrictMode>
    <MetaManagerProvider manager={(client?.metaManager ?? server?.metaManager)!}>
      <I18nextProvider i18n={(client?.localization ?? server?.localization)!}>
        {children}
      </I18nextProvider>
    </MetaManagerProvider>
  </StrictMode>
);

export default App;
