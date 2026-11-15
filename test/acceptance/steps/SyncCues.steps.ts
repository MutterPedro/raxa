import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(__dirname + '/../features/SyncCues.feature');

defineFeature(feature, (test) => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Logged-out user is invited to log in for syncing', ({ given, when, then }) => {
    given(/^I start from a fresh app with a bill named "(.*)"$/, async function (name: string) {
      // Own browser context: fresh IndexedDB, so this scenario starts from the empty
      // state (jumbo button) and owns bill id 1 instead of inheriting the previous one.
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);

      await page.getByTestId('new-bill-jumbo-button').click();
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await page.getByRole('button', { name: 'Criar' }).click();
      await expect(page.getByTestId('bill-item-name-1')).toContainText(name);
    });

    then('I should see a hint to log in for syncing', async function () {
      // The fake auth flow never logs in, so the app always shows the logged-out hint.
      await expect(page.getByTestId('sync-hint')).toBeVisible();
      await expect(page.getByTestId('sync-hint')).toContainText('Faça login para sincronizar');
    });

    when('I follow the sync hint', async function () {
      await page.getByTestId('sync-hint').click();
    });

    then('I should see the login screen', async function () {
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
    });
  });
});
