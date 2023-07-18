import type { TRouteObject } from '@lomray/vite-ssr-boost/interfaces/route-object';
import RouteManager from '@services/route-manager';

/**
 * Details routes
 */
const detailsRoutes: TRouteObject[] = [
  {
    index: true,
    lazyNR: () => import('@pages/details/index'),
  },
  {
    path: RouteManager.path('details.user'),
    lazyNR: () => import('@pages/details/user'),
  },
];

export default detailsRoutes;
