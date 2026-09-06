import { expect, test } from '@playwright/test';

test('KV hydrates without refetching, then client navigation reads the binding through HTTP', async ({
  page,
}) => {
  const errors: string[] = [];
  const apiRequests: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/message') apiRequests.push(request.url());
  });
  const response = await page.goto('/kv');

  expect(response?.status()).toBe(200);
  expect(await response!.text()).toContain('Hello from browser test KV');
  await expect(page).toHaveTitle('KV message | Minimal SSR example');
  await expect(page.getByText('Hello from browser test KV', { exact: true })).toBeVisible();
  // A hydrated router link proves that the initial document has become interactive.
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Minimal SSR example' })).toBeVisible();
  expect(apiRequests).toEqual([]);
  await page.getByRole('link', { name: 'KV message', exact: true }).click();
  await expect(page.getByText('Hello from browser test KV', { exact: true })).toBeVisible();
  expect(apiRequests).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('deferred data hydrates and remains interactive after client navigation', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/deferred');
  await expect(page.getByRole('listitem').filter({ hasText: 'Ada Lovelace' })).toBeVisible();
  await page.getByRole('button', { name: 'Count: 0', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Count: 1', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Minimal SSR example' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Deferred data' }).click();
  await expect(page.getByText('Loading users with Await…', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Count: 0', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Count: 1', exact: true })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Grace Hopper' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('lazy route CSS works on direct visits and client navigation', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/about');
  const note = page.getByText('This page is a lazy route.', { exact: false });

  await expect(note).toHaveCSS('background-color', 'rgb(238, 244, 250)');
  await expect(note).toHaveCSS('border-left-width', '4px');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Minimal SSR example' })).toBeVisible();
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(note).toHaveCSS('background-color', 'rgb(238, 244, 250)');
  await expect(page).toHaveTitle('About | Minimal SSR example');
  expect(errors).toEqual([]);
});

test('user navigation, redirects, client-only content and 404s retain their behavior', async ({
  page,
}) => {
  await page.goto('/users');
  await page.getByRole('link', { name: 'Grace Hopper', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Grace Hopper' })).toBeVisible();
  await page.goto('/redirect');
  await expect(page).toHaveURL('/');
  await page.getByRole('link', { name: 'Client only', exact: true }).click();
  await expect(page.getByText('Browser language:', { exact: false })).toBeVisible();
  const unknownUser = await page.goto('/users/999');

  expect(unknownUser?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'User not found' })).toBeVisible();
  const missing = await page.goto('/missing');

  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
