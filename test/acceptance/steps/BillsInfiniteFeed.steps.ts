import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(__dirname + '/../features/BillsInfiniteFeed.feature');

const rows = (page: Page) => page.locator('[data-testid^="bill-item-name-"]');

defineFeature(feature, (test) => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Older bills load as the feed reaches the bottom', ({ given, when, then, and }) => {
    given('I am in the home page', async function () {
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);
    });

    // Twelve rows are created through the form (each waits for its own row to land,
    // which also keeps ids predictable); after a reload only the first page is there.
    and('I have 12 bills', async function () {
      for (let i = 1; i <= 12; i++) {
        await page.getByTestId(i === 1 ? 'new-bill-jumbo-button' : 'new-bill-float-button').click();
        await page.getByTestId('new-bill-form-name-input').fill(`Conta ${i}`);
        await page.getByRole('button', { name: 'Criar' }).click();
        await expect(page.getByTestId(`bill-item-name-${i}`)).toBeVisible();
      }
    });

    and('I reload the home page', async function () {
      await page.reload();
      await expect(rows(page)).toHaveCount(10);
    });

    // jest-cucumber binds one definition per step occurrence, so each Then gets its own.
    then(/^I should see (\d+) bill rows$/, async function (count: string) {
      await expect(rows(page)).toHaveCount(Number(count));
    });

    when('I scroll to the bottom of the bills feed', async function () {
      await page.getByTestId('bills-list-sentinel').scrollIntoViewIfNeeded();
    });

    then(/^I should see (\d+) bill rows$/, async function (count: string) {
      await expect(rows(page)).toHaveCount(Number(count));
    });
  }, 120000);
});
