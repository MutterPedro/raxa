import { expect, test } from '@playwright/test';

// T1.2(b) — brand smoke: assets present in the build, self-hosted font active,
// no external font links in the document. App behavior is untouched here.

const ASSETS = [
  '/favicon.svg',
  '/favicon-16.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable-512.png',
  '/splash-light.png',
  '/splash-dark.png',
  '/brand/logo.svg',
  '/brand/lockup.svg',
  '/fonts/plus-jakarta-sans-latin-normal-var.woff2',
  '/fonts/plus-jakarta-sans-latin-ext-normal-var.woff2',
  '/fonts/plus-jakarta-sans-latin-italic-var.woff2',
  '/fonts/plus-jakarta-sans-latin-ext-italic-var.woff2',
];

test('every brand asset is served', async ({ request }) => {
  for (const path of ASSETS) {
    const res = await request.get(path);
    expect(res.ok(), `${path} should exist in the build`).toBe(true);
  }
});

test('no external font links in the document', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  expect(html).toMatch(/rel="icon".*favicon\.svg/);
});

test('Plus Jakarta Sans is the active self-hosted font', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts]
      .filter((f) => f.status === 'loaded')
      .map((f) => `${f.family} ${f.style} ${f.weight} ${f.status}`),
  );
  expect(loaded.some((f) => f.includes('Plus Jakarta Sans'))).toBe(true);
  const family = await page.evaluate(() => getComputedStyle(document.documentElement).fontFamily);
  expect(family).toContain('Plus Jakarta Sans');
});
