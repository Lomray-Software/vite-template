import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from 'react-router';
import users from '@data/users';

export const loader = ({ params }: LoaderFunctionArgs) => {
  const user = users.find(({ id }) => id === params.id);

  if (!user) {
    throw new Response('Not found', { status: 404 });
  }

  return user;
};

export const ErrorBoundary: FC = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <>
      <Meta>
        <title>{isNotFound ? 'User not found' : 'Unable to load user'} | Minimal SSR example</title>
        <meta name="description" content="The requested user could not be loaded." />
      </Meta>
      <h1>{isNotFound ? 'User not found' : 'Unable to load user'}</h1>
      <p>{isNotFound ? 'There is no user with this ID.' : 'Please try again later.'}</p>
      <Link to="/users">Back to users</Link>
    </>
  );
};

const User: FC = () => {
  const user = useLoaderData<typeof loader>();

  return (
    <>
      <Meta>
        <title>{user.name} | Minimal SSR example</title>
        <meta name="description" content={`${user.name}, ${user.role}.`} />
      </Meta>
      <h1>{user.name}</h1>
      <p>{user.role}</p>
      <Link to="/users">Back to users</Link>
    </>
  );
};

export default User;
