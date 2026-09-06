import { Meta } from '@lomray/react-head-manager';
import { dehydrate, HydrationBoundary, useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { usersQuery } from '@data/user-queries';
import type { TGetQueryClient } from '@helpers/query-client';

export const createLoader =
  (getQueryClient: TGetQueryClient) => async (args: LoaderFunctionArgs) => {
    const queryClient = await getQueryClient(args);

    await queryClient.prefetchQuery(usersQuery);

    return { dehydratedState: dehydrate(queryClient) };
  };

const UsersList: FC = () => {
  const { data = [] } = useQuery(usersQuery);

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
};

const Users: FC = () => {
  const { dehydratedState } = useLoaderData<ReturnType<typeof createLoader>>();

  return (
    <>
      <Meta>
        <title>Users | TanStack Query SSR example</title>
        <meta
          name="description"
          content="A prefetched TanStack Query list, ready before rendering."
        />
      </Meta>
      <h1>Users</h1>
      <p>The loader awaits prefetchQuery. This list stays fresh in the cache for 60 seconds.</p>
      <HydrationBoundary state={dehydratedState}>
        <UsersList />
      </HydrationBoundary>
    </>
  );
};

export default Users;
