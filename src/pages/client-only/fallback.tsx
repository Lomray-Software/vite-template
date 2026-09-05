import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';

const ClientOnlyFallback: FC = () => (
  <>
    <Meta>
      <title>Client only | Minimal SSR example</title>
      <meta name="description" content="A browser-only page with a server-rendered fallback." />
    </Meta>
    <h1>Client only</h1>
    <p role="status">Waiting for the browser to load this page.</p>
  </>
);

export default ClientOnlyFallback;
