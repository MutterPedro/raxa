import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function testWithinBrowser<T = unknown>(page: Page, t: () => Promise<[T, unknown]>): Promise<T> {
  await page.goto('http://0.0.0.0:5173/');

  const [item, error] = await page.evaluate(t);

  expect(error).toBeNull();
  return item!;
}
