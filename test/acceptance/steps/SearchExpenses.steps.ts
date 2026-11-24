import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(__dirname + '/../features/SearchExpenses.feature');

// Playwright assertions retry until timeout, which also rides out the search debounce.
const rows = (page: Page) => page.locator('[data-testid^="expense-item-name-"]');

// Quick add with a name: the name lives in the extra-options section, open by default.
async function addExpense(page: Page, amount: string, name: string): Promise<void> {
  await page.getByTestId('new-expense-button').click();
  await page.getByLabel('Nome da despesa').fill(name);
  await page.getByTestId('new-expense-form-amount-input').fill(amount);
  await page.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.getByTestId('new-expense-button')).toBeVisible();
}

defineFeature(feature, (test) => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Narrowing and widening the expense feed by name', ({ given, when, then, and }) => {
    given(/^I start from a fresh app with an empty bill named "(.*)"$/, async function (name: string) {
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

    when('I open the bill', async function () {
      await page.getByTestId('bill-item-name-1').click();
      await expect(page).toHaveURL(/\/bill\/1/);
    });

    and(/^I add an expense of (\d+)\$ named "(.*)"$/, async function (amount: string, name: string) {
      await addExpense(page, amount, name);
    });

    // jest-cucumber binds one definition per step occurrence, so each repeated step gets its own.
    and(/^I add another expense of (\d+)\$ named "(.*)"$/, async function (amount: string, name: string) {
      await addExpense(page, amount, name);
    });

    and(/^I add another expense of (\d+)\$ named "(.*)"$/, async function (amount: string, name: string) {
      await addExpense(page, amount, name);
    });

    then(/^I should see (\d+) expense rows$/, async function (count: string) {
      await expect(rows(page)).toHaveCount(Number(count));
    });

    when(/^I search the expenses for "(.*)"$/, async function (term: string) {
      await page.getByTestId('expenses-search-input').fill(term);
    });

    then(/^I should see only the expense named "(.*)"$/, async function (name: string) {
      await expect(rows(page)).toHaveCount(1);
      await expect(rows(page).first()).toContainText(name);
    });

    when(/^I search the expenses for "(.*)"$/, async function (term: string) {
      await page.getByTestId('expenses-search-input').fill(term);
    });

    then(/^I should see (\d+) expense rows$/, async function (count: string) {
      await expect(rows(page)).toHaveCount(Number(count));
    });

    when('I clear the expense search', async function () {
      await page.getByTestId('expenses-search-input').fill('');
    });

    then(/^I should see (\d+) expense rows$/, async function (count: string) {
      await expect(rows(page)).toHaveCount(Number(count));
    });
  }, 60000);
});
