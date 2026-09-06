import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { Suspense, use, useState } from 'react';
import { Await, Link, useLoaderData } from 'react-router';
import RouteManager from '@services/route-manager';

const fetchUsers = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });

  return [
    { id: '1', name: 'Ada Lovelace' },
    { id: '2', name: 'Grace Hopper' },
    { id: '3', name: 'Margaret Hamilton' },
  ];
};

export const loader = () => ({ title: 'Deferred data', users: fetchUsers() });

type Users = Awaited<ReturnType<typeof fetchUsers>>;

const UserList: FC<{ users: Users }> = ({ users }) => (
  <ul>
    {users.map((user) => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);

const UsersWithUse: FC<{ promise: Promise<Users> }> = ({ promise }) => (
  <UserList users={use(promise)} />
);

// Keep shell updates local while the data boundaries are still hydrating.
const Counter: FC = () => {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      Count: {count}
    </button>
  );
};

const Deferred: FC = () => {
  const data = useLoaderData<ReturnType<typeof loader>>();

  return (
    <>
      <Meta>
        <title>{data.title}</title>
        <meta name="description" content="Stream users from a React Router loader." />
      </Meta>
      <h1>{data.title}</h1>
      <p>The title arrives first. Users follow after 1.5 seconds.</p>
      <Counter />
      <section aria-labelledby="await-users">
        <h2 id="await-users">Users with Await</h2>
        <Suspense fallback={<p>Loading users with Await…</p>}>
          <Await resolve={data.users} errorElement={<p role="alert">Could not load users.</p>}>
            {(users: Users) => <UserList users={users} />}
          </Await>
        </Suspense>
      </section>
      <section aria-labelledby="use-users">
        <h2 id="use-users">Users with React use()</h2>
        <Suspense fallback={<p>Loading users with use()…</p>}>
          <UsersWithUse promise={data.users} />
        </Suspense>
      </section>
      <Link to={RouteManager.makeURL('home')}>Go back</Link>
    </>
  );
};

export { Deferred as Component };
