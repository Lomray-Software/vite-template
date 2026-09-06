import { expect, test } from '@playwright/test';

for (const [path, heading] of [
  ['/users', 'Users'],
  ['/users/2', 'Grace Hopper'],
]) {
  test(`${path} hydrates with no queryFn refetch for 59 seconds`, async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__queryFnCalls)).toEqual({});
    // Navigation exercises hydrated event handlers and remounts the query observer.
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'TanStack Query SSR example' })).toBeVisible();
    await page.clock.install();
    await page.clock.fastForward(59_000);
    await page.goBack();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.__queryFnCalls)).toEqual({});
    expect(errors).toEqual([]);
  });
}

test('list navigation uses cached profiles; a cold client navigation fetches once then reuses it', async ({
  page,
}) => {
  await page.goto('/users');
  await page.getByRole('link', { name: 'Grace Hopper', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Grace Hopper' })).toBeVisible();
  expect(await page.evaluate(() => window.__queryFnCalls)).toEqual({});

  // A document visit resets the browser client, leaving no list to seed the detail.
  await page.goto('/');
  await page.getByRole('link', { name: 'Open a user profile' }).click();
  await expect(page.getByText('Loading user…', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible();
  expect(await page.evaluate(() => window.__queryFnCalls)).toEqual({ 'users/1': 1 });
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('link', { name: 'Open a user profile' }).click();
  await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible();
  expect(await page.evaluate(() => window.__queryFnCalls)).toEqual({ 'users/1': 1 });
});
