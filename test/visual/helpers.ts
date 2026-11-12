import { Page, expect } from '@playwright/test';

const FIXED_NOW = new Date('2026-01-15T12:00:00');

/** Boots the app at '/' with a fixed clock and waits until it renders (fresh DB → empty state). */
export const gotoFresh = async (page: Page) => {
  await page.clock.setFixedTime(FIXED_NOW.getTime());
  await page.goto('/');
  await expect(page.getByTestId('new-bill-jumbo-button')).toBeVisible();
};

/** Boots fresh, seeds the deterministic demo data, then (re)navigates so routes render from the seeded DB. */
export const gotoSeeded = async (page: Page, route = '/') => {
  await gotoFresh(page);
  await page.evaluate(() => window.__seedVisualDemo?.());
  await page.goto(route);
};

/** Captures a golden screenshot after web fonts settle. Zero pixel budget on purpose:
 *  a generous ~330px diff budget silently swallowed a 30px avatar letter recolor once. */
export const capture = async (page: Page, name: string) => {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(page).toHaveScreenshot(`${name}.png`);
};
