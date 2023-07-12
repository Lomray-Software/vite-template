import Router from '@lomray/client-helpers-react/services/router';

/**
 * Application URL router
 */
const router = new Router({
  routes: {
    home: {
      url: '/',
    },
    details: {
      url: '/details',
      children: {
        user: {
          url: '/user/:id',
          params: { id: '' },
        },
      },
    },
    errorBoundary: {
      url: '/error-boundary',
    },
    nestedSuspense: {
      url: '/nested-suspense',
    },
  },
});

export default router;
