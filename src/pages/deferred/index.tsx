import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { Suspense, useState } from 'react';
import { Await, useLoaderData } from 'react-router';
import users from '@data/users';

const fetchUsers = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });

  return users;
};

export const loader = () => ({ title: 'Deferred data', users: fetchUsers() });

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
            {(resolvedUsers: typeof users) => (
              <ul>
                {resolvedUsers.map((user) => (
                  <li key={user.id}>{user.name}</li>
                ))}
              </ul>
            )}
          </Await>
        </Suspense>
      </section>
    </>
  );
};

export { Deferred as Component };
