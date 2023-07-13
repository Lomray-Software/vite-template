import type { TRouteObject } from '@lomray/vite-ssr-boost/interfaces/route-object';
import NotFound from '@pages/not-found';
import RouteManager from '@services/route-manager';

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
        children: [
          {
            index: true,
            lazyNR: () => import('@pages/details/index'),
          },
          {
            path: RouteManager.path('details.user'),
            lazyNR: () => import('@pages/details/user'),
          },
        ],
      },
      {
        path: RouteManager.path('errorBoundary'),
        lazyNR: () => import('@pages/error-boundary'),
      },
      {
        path: RouteManager.path('nestedSuspense'),
        lazyNR: () => import('@pages/nested-suspense'),
      },
    ],
  },
];

export default routes;
