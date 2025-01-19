import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(__dirname + '/../features/ListExistentBills.feature');

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

  test('Listing existent bills', ({ given, then, and }) => {
    given('I am in the home page', async function () {
      await page.goto('http://0.0.0.0:5173/');
      await expect(page).toHaveTitle(/Raxa/);
    });

    and(/^I have a bill with name "(.*)"$/, async function (name: string) {
      await page.getByTestId('new-bill-jumbo-button').click();
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    and(/^I have another bill with name "(.*)"$/, async function (name: string) {
      await page.getByTestId('new-bill-float-button').click();
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    then(/^I should see a bill row with name "(.*)"$/, async function (total: number) {
      const billTotalLocator = page.getByTestId('bill-item-name-1');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(total.toString());
    });

    and(/^I should see another bill row with name "(.*)"$/, async function (total: number) {
      const billTotalLocator = page.getByTestId('bill-item-name-2');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(total.toString());
    });
  }, 60000);
});
