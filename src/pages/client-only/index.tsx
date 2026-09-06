import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';

// eslint-disable-next-line import-x/prefer-default-export -- React Router lazy routes use this named export.
export const Component: FC = () => (
  <>
    <Meta>
      <title>Client only | Minimal SSR example</title>
      <meta name="description" content="A browser-only page with a server-rendered fallback." />
    </Meta>
    <h1>Client only</h1>
    <p>This page is now running in your browser.</p>
    <p>Browser language: {navigator.language}</p>
  </>
);
