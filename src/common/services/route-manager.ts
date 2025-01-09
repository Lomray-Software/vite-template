import { Manager } from '@lomray/react-route-manager';

/**
 * Application URL manager
 */
const manager = new Manager({
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
    redirect: {
      url: '/redirect-demo',
    },
    onlyClientPage: {
      url: '/only-client-page',
    },
    notLazy: {
      url: '/not-lazy',
    },
  },
});

export default manager;
