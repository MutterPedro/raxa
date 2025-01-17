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

    and(/^I have a bill with total (\d+)\$$/, async function (amount: number) {
      await page.getByTestId('new-expense-jumbo-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount.toString());
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    and(/^I have another bill with total (\d+)\$$/, async function (amount: number) {
      await page.getByTestId('new-expense-float-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount.toString());
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    then(/^I should see a bill row with total (\d+)\$$/, async function (total: number) {
      const billTotalLocator = page.getByTestId('bill-total-1');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(total.toString());
    });

    and(/^I should see another bill row with total (\d+)\$$/, async function (total: number) {
      const billTotalLocator = page.getByTestId('bill-total-2');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(total.toString());
    });
  }, 60000);
});
