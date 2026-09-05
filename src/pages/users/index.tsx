import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { Link, useLoaderData } from 'react-router';
import users from '@data/users';

export const loader = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });

  return users;
};

const Users: FC = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Meta>
        <title>Users | Minimal SSR example</title>
        <meta name="description" content="Users loaded before the server sends the page." />
      </Meta>
      <h1>Users</h1>
      <p>The loader waits 300 ms, then returns this list as resolved data.</p>
      <ul>
        {data.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Users;
