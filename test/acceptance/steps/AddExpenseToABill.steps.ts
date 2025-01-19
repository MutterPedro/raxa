import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(__dirname + '/../features/AddExpenseToABill.feature');

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

  test('Adding an expense to a bill', ({ given, when, then, and, pending }) => {
    given('I am in the home page', async function () {
      await page.goto('http://0.0.0.0:5173/');
      await expect(page).toHaveTitle(/Raxa/);
    });

    and(/^I have a bill with name "(.*)"$/, async function (name: string) {
      await page.getByTestId('new-bill-jumbo-button').click();
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    and(/^I click in the bill with name "(.*)"$/, async function (name: string) {
      const billLocator = page.getByTestId('bill-item-name-1');
      await expect(billLocator).toBeVisible();
      await expect(billLocator).toContainText(name);

      await billLocator.click();
      await expect(page).toHaveURL(/\/bill\/1/);
    });

    when(/^I add an expense of (\d+)\$ to the bill$/, async function (amount: number) {
      await page.getByTestId('new-expense-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount.toString());
      await page.getByRole('button', { name: 'Adicionar' }).click();
    });

    and(/^I add another expense of (\d+)\$ to the bill$/, async function () {
      pending();
    });

    then(/^I should see the bill total equal to (\d+)\$$/, async function () {
      pending();
    });
  });
});
