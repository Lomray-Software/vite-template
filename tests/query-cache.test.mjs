import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { hydrate, QueryObserver } from '@tanstack/react-query';
import { createServer } from 'vite';

// Load the real TypeScript factory, query functions and route loaders without a browser.
const vite = await createServer({
  configFile: false,
  resolve: { tsconfigPaths: true },
  server: { middlewareMode: true },
});
after(() => vite.close());

const { default: createQueryClient, STALE_TIME } = await vite.ssrLoadModule(
  '/src/common/helpers/query-client.ts',
);
const { usersQuery, userQuery } = await vite.ssrLoadModule('/src/data/user-queries.ts');
const { createLoader: createListLoader } = await vite.ssrLoadModule('/src/pages/users/index.tsx');
const { createLoader: createDetailLoader } = await vite.ssrLoadModule('/src/pages/users/user.tsx');
const args = (id = '2') => ({
  params: { id },
  request: new Request(`http://localhost/users/${id}`),
  context: {},
});

test('resolved list hydration makes zero queryFn calls before 60 seconds; refetches when stale', async (t) => {
  const server = createQueryClient();
  const browser = createQueryClient();
  t.after(() => {
    server.clear();
    browser.clear();
  });
  const { dehydratedState } = await createListLoader(() => server)(args());

  assert.equal(dehydratedState.queries.length, 1);
  assert.equal(dehydratedState.queries[0].state.status, 'success');
  assert.equal(dehydratedState.queries[0].promise, undefined);
  hydrate(browser, structuredClone(dehydratedState));
  let calls = 0;
  const options = {
    ...usersQuery,
    queryFn: () => {
      calls += 1;
      return usersQuery.queryFn();
    },
  };
  const updatedAt = browser.getQueryState(usersQuery.queryKey).dataUpdatedAt;
  let now = updatedAt + 1;
  t.mock.method(Date, 'now', () => now);

  for (const age of [1, STALE_TIME - 1]) {
    now = updatedAt + age;
    const observer = new QueryObserver(browser, options);
    const unsubscribe = observer.subscribe(() => {});

    assert.equal(observer.getCurrentResult().isStale, false);
    await browser.fetchQuery(options);
    unsubscribe();
    assert.equal(calls, 0);
  }

  now = updatedAt + STALE_TIME + 1;
  await browser.fetchQuery(options);
  assert.equal(calls, 1);
});

test('pending detail hydration consumes the transferred promise without calling the browser queryFn', async (t) => {
  const server = createQueryClient();
  const browser = createQueryClient();
  t.after(() => {
    server.clear();
    browser.clear();
  });
  const { dehydratedState } = await createDetailLoader(() => server)(args());
  const [query] = dehydratedState.queries;

  assert.equal(dehydratedState.queries.length, 1);
  assert.equal(query.state.status, 'pending');
  assert.ok(query.promise instanceof Promise);
  // Mimic a transport-created native promise and a separately decoded result.
  const transferred = {
    ...dehydratedState,
    queries: [{ ...query, promise: query.promise.then((data) => structuredClone(data)) }],
  };
  hydrate(browser, transferred);
  let calls = 0;
  const options = {
    ...userQuery('2'),
    queryFn: () => {
      calls += 1;
      throw new Error('Unexpected hydration refetch');
    },
  };
  const observer = new QueryObserver(browser, options);
  const unsubscribe = observer.subscribe(() => {});
  t.after(unsubscribe);
  const user = await browser.fetchQuery(options);

  assert.equal(user.name, 'Grace Hopper');
  assert.equal(calls, 0);
  const updatedAt = browser.getQueryState(options.queryKey).dataUpdatedAt;
  t.mock.method(Date, 'now', () => updatedAt + STALE_TIME - 1);
  await browser.fetchQuery(options);
  assert.equal(calls, 0);
});

test('list-to-detail navigation reuses full cached records and preserves their freshness', async (t) => {
  const client = createQueryClient();
  t.after(() => client.clear());
  await createListLoader(() => client)(args());
  const updatedAt = client.getQueryState(usersQuery.queryKey).dataUpdatedAt;
  const { dehydratedState } = await createDetailLoader(() => client)(args());
  const detail = dehydratedState.queries.find(({ queryKey }) => queryKey.length === 2);

  assert.equal(detail.state.status, 'success');
  assert.equal(detail.promise, undefined);
  assert.equal(detail.state.dataUpdatedAt, updatedAt);
  assert.equal(detail.state.data.name, 'Grace Hopper');
  assert.equal(client.isFetching(), 0);
});

test('a stale list starts a native detail query; unknown IDs return 404 before streaming', async (t) => {
  const client = createQueryClient();
  t.after(() => client.clear());
  const data = await usersQuery.queryFn();
  client.setQueryData(usersQuery.queryKey, data, { updatedAt: Date.now() - STALE_TIME - 1 });
  const load = createDetailLoader(() => client);
  const { dehydratedState } = await load(args());
  const detail = dehydratedState.queries.find(({ queryKey }) => queryKey.length === 2);

  assert.equal(detail.state.status, 'pending');
  assert.equal((await detail.promise).name, 'Grace Hopper');
  await assert.rejects(
    load(args('999')),
    (error) => error instanceof Response && error.status === 404,
  );
});

test('concurrent request clients contain only their own detail query', async (t) => {
  const first = createQueryClient();
  const second = createQueryClient();
  t.after(() => {
    first.clear();
    second.clear();
  });
  assert.notEqual(first, second);
  const states = await Promise.all([
    createDetailLoader(() => first)(args('1')),
    createDetailLoader(() => second)(args('2')),
  ]);
  const values = await Promise.all(
    states.map(({ dehydratedState }) => {
      assert.equal(dehydratedState.queries.length, 1);
      return dehydratedState.queries[0].promise;
    }),
  );

  assert.deepEqual(
    values.map(({ name }) => name),
    ['Ada Lovelace', 'Grace Hopper'],
  );
  assert.equal(first.getQueryData(userQuery('2').queryKey), undefined);
  assert.equal(second.getQueryData(userQuery('1').queryKey), undefined);
});
