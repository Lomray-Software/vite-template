import AppLayout from '@components/layouts/app';
import ClientOnlyFallback from '@pages/client-only/fallback';
import Home from '@pages/home';
import NotFound from '@pages/not-found';
import Redirect from '@pages/redirect';
import Users, { loader as usersLoader } from '@pages/users';
import User, { loader as userLoader, ErrorBoundary } from '@pages/users/user';

const routes = [
  {
    Component: AppLayout,
    children: [
      { path: '/', Component: Home },
      { path: '/users', Component: Users, loader: usersLoader },
      { path: '/deferred', lazy: () => import('@pages/deferred') },
      { path: '/users/:id', Component: User, loader: userLoader, ErrorBoundary },
      { path: '/about', lazy: () => import('@pages/about') },
      { path: '/redirect', Component: Redirect },
      {
        path: '/client-only',
        lazy: () => import('@pages/client-only'),
        onlyClient: ClientOnlyFallback,
      },
      { path: '*', Component: NotFound },
    ],
  },
];

export default routes;
