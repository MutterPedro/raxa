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
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);
    });

    and('I click in the create bill button', async function () {
      await page.getByTestId('new-bill-jumbo-button').click();
      await expect(page.getByTestId('new-bill-form')).toBeVisible();
    });

    when(/^I enter "(.*)" as the name$/, async function (name: string) {
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await expect(page.getByTestId('new-bill-form-name-input')).toHaveValue(name);
    });

    and('I submit the form', async function () {
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    then(/^I should see a bill row with total (\d+)\$$/, async function (expectedTotal: number) {
      const billTotalLocator = page.getByTestId('bill-total-1');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(expectedTotal.toString());
    });

    and(/^I should see a bill row with name "(.*)"$/, async function (name: string) {
      const billTotalLocator = page.getByTestId('bill-item-name-1');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(name);
    });
  });

  test('Creating a bill with a first expense in one submit', ({ given, when, then, and }) => {
    given('I am in the home page', async function () {
      // Own browser context: fresh IndexedDB, so this scenario starts from the empty
      // state (jumbo button) and owns bill id 1 instead of inheriting the previous one.
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);
    });

    and('I click in the create bill button', async function () {
      await page.getByTestId('new-bill-jumbo-button').click();
      await expect(page.getByTestId('new-bill-form')).toBeVisible();
    });

    when(/^I enter "(.*)" as the name$/, async function (name: string) {
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await expect(page.getByTestId('new-bill-form-name-input')).toHaveValue(name);
    });

    and(/^I enter (\d+)\$ as the first expense amount$/, async function (amount: string) {
      const amountInput = page.getByTestId('new-bill-form-amount-input');
      await amountInput.fill(amount);
      await expect(amountInput).toHaveValue(amount);
    });

    and(/^I add "(.*)" as the first expense participant$/, async function (participant: string) {
      const participantInput = page.locator('#new-bill-form-participant-input');
      await expect(participantInput).toBeVisible();
      await participantInput.fill(participant);
      await participantInput.press('Enter');
    });

    and('I submit the form', async function () {
      await page.getByRole('button', { name: 'Criar' }).click();
    });

    then(/^I should see a bill row with total (\d+)\$$/, async function (expectedTotal: number) {
      const billTotalLocator = page.getByTestId('bill-total-1');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(expectedTotal.toString());
    });

    and(/^I should see a bill row with name "(.*)"$/, async function (name: string) {
      const billTotalLocator = page.getByTestId('bill-item-name-1');
      await expect(billTotalLocator).toBeVisible();
      await expect(billTotalLocator).toContainText(name);
    });
  });
});
