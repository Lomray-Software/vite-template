import { Meta } from '@lomray/react-head-manager';
import { dehydrate, HydrationBoundary, useSuspenseQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { Suspense } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { isRouteErrorResponse, Link, useLoaderData, useParams, useRouteError } from 'react-router';
import { userQuery, usersQuery } from '@data/user-queries';
import users from '@data/users';
import type { TGetQueryClient } from '@helpers/query-client';
import { STALE_TIME } from '@helpers/query-client';

export const createLoader =
  (getQueryClient: TGetQueryClient) => async (args: LoaderFunctionArgs) => {
    const id = args.params.id ?? '';

    // Validate before returning the pending query so unknown IDs retain an HTTP 404.
    if (!users.some((user) => user.id === id)) {
      throw new Response('Not found', { status: 404 });
    }

    const queryClient = await getQueryClient(args);
    const options = userQuery(id);
    const list = queryClient.getQueryState(usersQuery.queryKey);
    const cachedUser = list?.data?.find((user) => user.id === id);

    // The list contains complete profiles. Reuse it without extending its freshness.
    if (cachedUser && list && !list.isInvalidated && Date.now() - list.dataUpdatedAt < STALE_TIME) {
      const detailUpdatedAt = queryClient.getQueryState(options.queryKey)?.dataUpdatedAt ?? 0;

      if (list.dataUpdatedAt > detailUpdatedAt) {
        queryClient.setQueryData(options.queryKey, cachedUser, { updatedAt: list.dataUpdatedAt });
      }
    }

    void queryClient.prefetchQuery(options);

    return { dehydratedState: dehydrate(queryClient) };
  };

export const ErrorBoundary: FC = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <>
      <Meta>
        <title>
          {isNotFound ? 'User not found' : 'Unable to load user'} | TanStack Query SSR example
        </title>
        <meta name="description" content="The requested user could not be loaded." />
      </Meta>
      <h1>{isNotFound ? 'User not found' : 'Unable to load user'}</h1>
      <p>{isNotFound ? 'There is no user with this ID.' : 'Please try again later.'}</p>
      <Link to="/users">Back to users</Link>
    </>
  );
};

const UserDetails: FC = () => {
  const { id = '' } = useParams();
  const { data: user } = useSuspenseQuery(userQuery(id));

  return (
    <>
      <h1>{user.name}</h1>
      <p>{user.role}</p>
      <Link to="/users">Back to users</Link>
    </>
  );
};

const User: FC = () => {
  const { dehydratedState } = useLoaderData<ReturnType<typeof createLoader>>();

  return (
    <>
      <Meta>
        <title>User profile | TanStack Query SSR example</title>
        <meta name="description" content="A user profile streamed into the TanStack Query cache." />
      </Meta>
      <p>
        Direct visits stream the profile after 800 ms. A fresh users list supplies it from cache.
      </p>
      <HydrationBoundary state={dehydratedState}>
        <Suspense fallback={<p role="status">Loading user…</p>}>
          <UserDetails />
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default User;
