import { defineFeature, loadFeature } from 'jest-cucumber';
import { chromium, Page, Browser, expect } from '@playwright/test';

const feature = loadFeature(__dirname + '/../features/CreateBill.feature');

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

  test('Creating a valid bill anonymously', ({ given, when, then, and }) => {
    given('I am in the home page', async function () {
      await page.goto('http://0.0.0.0:5173/');
      await expect(page).toHaveTitle(/Raxa/);
    });

    and('I click in the create bill button', async function () {
      await page.getByTestId('new-expense-jumbo-button').click();
      await expect(page.getByTestId('new-expense-form')).toBeVisible();
    });

    when(/^I enter (\d+)\$ as the total amount$/, async function (amount: number) {
      await page.getByTestId('new-expense-form-amount-input').fill(amount.toString());
      await expect(page.getByTestId('new-expense-form-amount-input')).toHaveValue(amount.toString());
    });

    and(/^I enter (\w+) as a participant$/, async function (participantName: string) {
      await page.getByTestId('new-expense-form-participants-input').fill(participantName);
      await expect(page.getByTestId('new-expense-form-participants-input')).toHaveValue(participantName);
    });

    and('I submit the form', async function () {
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    then(/^I should see a bill row with total (\d+)\$$/, async function (expectedTotal: number) {
      const billTotalLocator = page.getByTestId('bill-total-1');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(expectedTotal.toString());
    });
  });
});
