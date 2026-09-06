import { queryOptions } from '@tanstack/react-query';
import users from '@data/users';

// Local data has no HTTP requests, so count actual browser queryFn executions.
const countQuery = (key: string) => {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__queryFnCalls ??= {};
    window.__queryFnCalls[key] = (window.__queryFnCalls[key] ?? 0) + 1;
  }
};

export const usersQuery = queryOptions({
  queryKey: ['users'],
  queryFn: () => {
    countQuery('users');

    return Promise.resolve(users);
  },
});

export const userQuery = (id: string) =>
  queryOptions({
    queryKey: ['users', id],
    queryFn: async () => {
      countQuery(`users/${id}`);
      await new Promise((resolve) => {
        setTimeout(resolve, 800);
      });

      const user = users.find((item) => item.id === id);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },
  });
