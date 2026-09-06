import AppLayout from '@components/layouts/app';
import { getQueryClient } from '@helpers/query-client';
import ClientOnlyFallback from '@pages/client-only/fallback';
import Home from '@pages/home';
import NotFound from '@pages/not-found';
import Redirect from '@pages/redirect';
import Users, { createLoader as usersLoader } from '@pages/users';
import User, { createLoader as userLoader, ErrorBoundary } from '@pages/users/user';

const routes = [
  {
    Component: AppLayout,
    children: [
      { path: '/', Component: Home },
      { path: '/users', Component: Users, loader: usersLoader(getQueryClient) },
      { path: '/deferred', lazy: () => import('@pages/deferred') },
      { path: '/users/:id', Component: User, loader: userLoader(getQueryClient), ErrorBoundary },
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
