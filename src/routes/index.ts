import type { TRouteObject } from '@lomray/vite-ssr-boost/interfaces/route-object';
import NotFound from '@pages/not-found';
import RouteManager from '@services/route-manager';
import DetailsRoutes from './details';

/**
 * Application routes
 */
const routes: TRouteObject[] = [
  {
    ErrorBoundary: NotFound,
    children: [
      {
        path: RouteManager.path('home'),
        lazyNR: () => import('@pages/home'),
      },
      {
        path: RouteManager.path('details'),
        children: DetailsRoutes,
      },
      {
        path: RouteManager.path('errorBoundary'),
        lazyNR: () => import('@pages/error-boundary'),
      },
      {
        path: RouteManager.path('nestedSuspense'),
        lazyNR: () => import('@pages/nested-suspense'),
      },
      {
        path: RouteManager.path('redirect'),
        lazyNR: () => import('@pages/redirect'),
      },
    ],
  },
];

export default routes;
