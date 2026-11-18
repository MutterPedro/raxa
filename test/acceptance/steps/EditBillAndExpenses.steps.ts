import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { brl } from './brl';

const feature = loadFeature(__dirname + '/../features/EditBillAndExpenses.feature');

defineFeature(feature, (test) => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Renaming a bill from its page', ({ given, when, then, and }) => {
    given(/^I start from a fresh app with a bill named "(.*)"$/, async function (name: string) {
      // Own browser context: fresh IndexedDB, so the scenario owns bill id 1.
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);

      await page.getByTestId('new-bill-jumbo-button').click();
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await page.getByRole('button', { name: 'Criar' }).click();
      await expect(page.getByTestId('bill-item-name-1')).toContainText(name);
    });

    and('I open that bill', async function () {
      await page.getByTestId('bill-item-name-1').click();
      await expect(page).toHaveURL(/\/bill\/1/);
      await expect(page.getByTestId('bill-total-span')).toBeVisible();
    });

    when('I ask to edit the bill', async function () {
      await page.getByTestId('edit-bill-button').click();
      await expect(page.getByTestId('edit-bill-form')).toBeVisible();
    });

    and(/^I change the bill name to "(.*)"$/, async function (name: string) {
      await page.getByTestId('edit-bill-form-name-input').fill(name);
    });

    and('I save the bill edit', async function () {
      await page.getByTestId('edit-bill-form-submit').click();
      await expect(page.getByTestId('edit-bill-form')).toBeHidden();
    });

    then(/^I should see the bill heading "(.*)"$/, async function (name: string) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
      await expect(page.getByText('Conta atualizada')).toBeVisible();
    });

    and(/^I should see the bills list with the name "(.*)"$/, async function (name: string) {
      await page.goBack();
      await expect(page.getByTestId('bill-item-name-1')).toContainText(name);
    });
  });

  test('Editing an expense amount from the bill page', ({ given, when, then, and }) => {
    given(/^I start from a fresh app with a bill named "(.*)"$/, async function (name: string) {
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);

      await page.getByTestId('new-bill-jumbo-button').click();
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await page.getByRole('button', { name: 'Criar' }).click();
      await expect(page.getByTestId('bill-item-name-1')).toContainText(name);
    });

    and('I open that bill', async function () {
      await page.getByTestId('bill-item-name-1').click();
      await expect(page).toHaveURL(/\/bill\/1/);
      await expect(page.getByTestId('bill-total-span')).toBeVisible();
    });

    and(/^I add an expense of (\d+)\$ to the bill$/, async function (amount: string) {
      await page.getByTestId('new-expense-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount);
      await page.getByRole('button', { name: 'Adicionar' }).click();
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total ${brl(Number(amount))}`);
    });

    when('I ask to edit the expense', async function () {
      // First expense created in this scenario owns id 1.
      await page.getByTestId('edit-expense-1-button').click();
      await expect(page.getByTestId('edit-expense-form')).toBeVisible();
    });

    then('I should see the expense edit form', async function () {
      await expect(page.getByRole('heading', { name: 'Editar despesa' })).toBeVisible();
    });

    when(/^I change the expense amount to (\d+)\$$/, async function (amount: string) {
      await page.getByTestId('edit-expense-form-amount-input').fill(amount);
    });

    and('I save the expense edit', async function () {
      await page.getByRole('button', { name: 'Salvar' }).click();
      await expect(page.getByTestId('edit-expense-form')).toBeHidden();
    });

    then(/^I should see the bill total equal to (\d+)\$$/, async function (amount: string) {
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total ${brl(Number(amount))}`);
    });

    and(/^I should see the expense row with amount (\d+)\$$/, async function (amount: string) {
      const row = page.locator('li', { hasText: 'Rachidinho' });
      await expect(row.getByText(brl(Number(amount)))).toBeVisible();
      await expect(page.getByText('Despesa atualizada')).toBeVisible();
    });
  });

  test('Paying on behalf of everyone from outside the split', ({ given, when, then, and }) => {
    given(/^I start from a fresh app with a bill named "(.*)"$/, async function (name: string) {
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);

      await page.getByTestId('new-bill-jumbo-button').click();
      await page.getByTestId('new-bill-form-name-input').fill(name);
      await page.getByRole('button', { name: 'Criar' }).click();
      await expect(page.getByTestId('bill-item-name-1')).toContainText(name);
    });

    and('I open that bill', async function () {
      await page.getByTestId('bill-item-name-1').click();
      await expect(page).toHaveURL(/\/bill\/1/);
      await expect(page.getByTestId('bill-total-span')).toBeVisible();
    });

    and(/^I add an expense of (\d+)\$ split with "(.*)"$/, async function (amount: string, participant: string) {
      await page.getByTestId('new-expense-button').click();
      await page.getByTestId('new-expense-form-amount-input').fill(amount);
      // The options section is open by default: add a typed participant on top of self.
      const participantInput = page.locator('#new-expense-form-participant-input');
      await participantInput.fill(participant);
      await participantInput.press('Enter');
      await page.getByRole('button', { name: 'Adicionar' }).click();
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total ${brl(Number(amount))}`);
    });

    when('I ask to edit the expense', async function () {
      await page.getByTestId('edit-expense-1-button').click();
      await expect(page.getByTestId('edit-expense-form')).toBeVisible();
    });

    and(/^I remove "(.*)" from the participants$/, async function (participant: string) {
      await page.getByRole('button', { name: `Remove ${participant}` }).click();
    });

    and('I save the expense edit', async function () {
      await page.getByRole('button', { name: 'Salvar' }).click();
      await expect(page.getByTestId('edit-expense-form')).toBeHidden();
    });

    then(/^I should see the bill total equal to (\d+)\$$/, async function (amount: string) {
      await expect(page.getByTestId('bill-total-span')).toHaveText(`Total ${brl(Number(amount))}`);
    });

    and(/^I should see "(.*)" with a (\d+)\$ part to pay$/, async function (participant: string, amount: string) {
      const row = page.locator('li').filter({ has: page.getByTestId(`bill-part-participant-${participant}`) });
      await expect(row.getByTestId(`bill-part-amount-${participant}`)).toHaveText(brl(Number(amount)));
      await expect(row.getByText('a pagar')).toBeVisible();
    });

    and(/^I should see "(.*)" with a (\d+)\$ part to receive$/, async function (participant: string, amount: string) {
      const row = page.locator('li').filter({ has: page.getByTestId(`bill-part-participant-${participant}`) });
      // The outside payer shares in nothing and is simply owed the whole amount.
      // brl() prepends the symbol before the minus: `R$ -90,00`, as formatCurrency does.
      await expect(row.getByTestId(`bill-part-amount-${participant}`)).toHaveText(brl(-Number(amount)));
      await expect(row.getByText('a receber')).toBeVisible();
    });
  });
});
