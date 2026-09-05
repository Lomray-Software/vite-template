import { Meta } from '@lomray/react-head-manager';
import Navigate from '@lomray/vite-ssr-boost/components/navigate';
import type { FC } from 'react';

const Redirect: FC = () => (
  <>
    <Meta>
      <title>Redirecting | Minimal SSR example</title>
      <meta name="description" content="Redirecting to the home page." />
    </Meta>
    <Navigate to="/" />
  </>
);

export default Redirect;
