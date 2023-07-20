import type { TRouteObject } from '@lomray/vite-ssr-boost/interfaces/route-object';
import RouteManager from '@services/route-manager';

/**
 * Details routes
 */
const detailsRoutes: TRouteObject[] = [
  {
    index: true,
    lazy: () => import('@pages/details/index'),
  },
  {
    path: RouteManager.path('details.user'),
    lazy: () => import('@pages/details/user'),
  },
];

export default detailsRoutes;
