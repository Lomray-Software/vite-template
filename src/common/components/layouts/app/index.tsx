import ScrollToTop from '@lomray/vite-ssr-boost/components/scroll-to-top';
import type { FC } from 'react';
import { Outlet } from 'react-router';

/**
 * Application layout
 * @constructor
 */
const AppLayout: FC = () => (
  <div>
    <ScrollToTop />
    <main className="main">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
