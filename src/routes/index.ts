import type { TRouteObject } from '@lomray/vite-ssr-boost/interfaces/route-object';
import NotFound from '@pages/not-found';
import Router from '@services/router';

/**
 * Application routes
 */
const routes: TRouteObject[] = [
  {
    ErrorBoundary: NotFound,
    children: [
      {
        path: Router.path('home'),
        lazyNR: () => import('@pages/home'),
      },
      {
        path: Router.path('details'),
        children: [
          {
            index: true,
            lazyNR: () => import('@pages/details/index'),
          },
          {
            path: Router.path('details.user'),
            lazyNR: () => import('@pages/details/user'),
          },
        ],
      },
      {
        path: Router.path('errorBoundary'),
        lazyNR: () => import('@pages/error-boundary'),
      },
      {
        path: Router.path('nestedSuspense'),
        lazyNR: () => import('@pages/nested-suspense'),
      },
    ],
  },
];

export default routes;
