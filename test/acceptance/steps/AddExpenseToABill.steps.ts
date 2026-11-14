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

  test('Adding an expense to a bill', ({ given, when, then, and }) => {
    given('I am in the home page', async function () {
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);
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

    when(/^I add an expense of (\d+)\$ to the bill$/, async function (amount: string) {
      await page.getByTestId('new-expense-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount);
      await page.getByRole('button', { name: 'Adicionar' }).click();
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total R$ ${Number(amount).toFixed(2)}`);
      await expect(page.getByTestId('new-expense-button')).toBeVisible();
    });

    and(/^I add another expense of (\d+)\$ to the bill$/, async function (amount: string) {
      await page.getByTestId('new-expense-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount);
      await page.getByRole('button', { name: 'Adicionar' }).click();
      await expect(page.getByTestId('new-expense-button')).toBeVisible();
    });

    then(/^I should see the bill total equal to (\d+)\$$/, async function (amount: string) {
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total R$ ${Number(amount).toFixed(2)}`);
    });
  });

  test('Quick add expense by amount only', ({ given, when, then, and }) => {
    given(
      /^I start from a fresh app with a bill named "(.*)" that has a first expense of (\d+)\$ split with "(.*)"$/,
      async function (name: string, amount: string, participant: string) {
        // Own browser context: fresh IndexedDB, so this scenario starts from the empty
        // state (jumbo button) and owns bill id 1 instead of inheriting the previous one.
        const context = await browser.newContext();
        page = await context.newPage();
        await page.goto('http://127.0.0.1:5173/');
        await expect(page).toHaveTitle(/raxa/);

        await page.getByTestId('new-bill-jumbo-button').click();
        await expect(page.getByTestId('new-bill-form')).toBeVisible();
        await page.getByTestId('new-bill-form-name-input').fill(name);
        await page.getByTestId('new-bill-form-amount-input').fill(amount);
        const participantInput = page.locator('#new-bill-form-participant-input');
        await expect(participantInput).toBeVisible();
        await participantInput.fill(participant);
        await participantInput.press('Enter');
        await page.getByRole('button', { name: 'Criar' }).click();
        await expect(page.getByTestId('bill-item-name-1')).toContainText(name);
      },
    );

    when('I open the expense form', async function () {
      const billLocator = page.getByTestId('bill-item-name-1');
      await expect(billLocator).toBeVisible();
      await billLocator.click();
      await expect(page).toHaveURL(/\/bill\/1/);

      await page.getByTestId('new-expense-button').click();
      await expect(page.getByTestId('new-expense-form')).toBeVisible();
    });

    and('I hide the extra expense options', async function () {
      await page.getByTestId('new-expense-more-toggle').click();
      await expect(page.locator('#new-expense-form-participant-input')).toBeHidden();
    });

    and(/^I add an expense of (\d+)\$ to the bill$/, async function (amount: string) {
      await page.getByTestId('new-expense-form-amount-input').fill(amount);
      await page.getByRole('button', { name: 'Adicionar' }).click();
      await expect(page.getByTestId('new-expense-button')).toBeVisible();
    });

    then(/^I should see the bill total equal to (\d+)\$$/, async function (amount: string) {
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total R$ ${Number(amount).toFixed(2)}`);
    });

    and(/^I should see division rows for both "(.*)" and "(.*)"$/, async function (selfName: string, other: string) {
      // The 60$ quick add defaulted to the bill participants (both people) and to the
      // self payer, so the division stays at -50$/+50$ across the 40$ + 60$ expenses.
      await expect(page.getByTestId(`bill-part-participant-${selfName}`)).toHaveText(selfName);
      await expect(page.getByTestId(`bill-part-amount-${selfName}`)).toHaveText('R$ -50.00');
      await expect(page.getByTestId(`bill-part-participant-${other}`)).toHaveText(other);
      await expect(page.getByTestId(`bill-part-amount-${other}`)).toHaveText('R$ 50.00');
    });
  });

  test('Undo an added expense', ({ given, when, then }) => {
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

    when(/^I add an expense of (\d+)\$ to the bill$/, async function (amount: string) {
      await page.getByTestId('bill-item-name-1').click();
      await expect(page).toHaveURL(/\/bill\/1/);

      await page.getByTestId('new-expense-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount);
      await page.getByRole('button', { name: 'Adicionar' }).click();
      await expect(page.getByTestId('new-expense-button')).toBeVisible();
    });

    then('I should see an undo affordance for the added expense', async function () {
      await expect(page.getByText('Despesa adicionada')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Desfazer' })).toBeVisible();
      await expect(page.getByTestId('bill-total-span')).toHaveText('Total R$ 25.00');
    });

    when('I undo the added expense', async function () {
      await page.getByRole('button', { name: 'Desfazer' }).click();
      await expect(page.getByText('Despesa adicionada')).toBeHidden();
    });

    then(/^I should see the bill total equal to (\d+)\$$/, async function (amount: string) {
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total R$ ${Number(amount).toFixed(2)}`);
    });
  });
});
