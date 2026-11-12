import { defineFeature, loadFeature } from 'jest-cucumber';
import { chromium, Page, Browser, expect } from '@playwright/test';

const feature = loadFeature(__dirname + '/../features/MobileHeaderNavigation.feature');

defineFeature(feature, (test) => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    page = await context.newPage();
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Visitor opens the login screen from a phone', ({ given, when, then }) => {
    given('I am in the home page in a phone viewport', async function () {
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);
      await expect(page.getByTestId('header-login-link')).toBeVisible();
    });

    when('I click the header login link', async function () {
      await page.getByTestId('header-login-link').click();
    });

    then('I should see the login form', async function () {
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByLabel('Email')).toBeVisible();
    });
  });
});
