import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(__dirname + '/../features/DeleteBill.feature');

defineFeature(feature, (test) => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Deleting a bill goes through a cancellable confirmation', ({ given, when, then, and }) => {
    const askToDeleteBill = async function () {
      await page.getByTestId('delete-bill-button').click();
    };

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

    and('I open that bill', async function () {
      await page.getByTestId('bill-item-name-1').click();
      await expect(page).toHaveURL(/\/bill\/1/);
      await expect(page.getByTestId('bill-total-span')).toBeVisible();
    });

    when('I ask to delete the bill', askToDeleteBill);

    then('I should see a confirmation about deleting the bill', async function () {
      await expect(page.getByRole('dialog', { name: 'Apagar conta?' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Apagar', exact: true })).toBeVisible();
    });

    when('I cancel the deletion', async function () {
      await page.getByRole('button', { name: 'Cancelar' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
    });

    then(/^I should still be viewing the bill "(.*)"$/, async function (name: string) {
      await expect(page).toHaveURL(/\/bill\/1/);
      await expect(page.getByRole('heading', { name })).toBeVisible();
      await expect(page.getByTestId('bill-total-span')).toBeVisible();
    });

    // Second use of the same feature step: jest-cucumber binds one definition per line.
    when('I ask to delete the bill', askToDeleteBill);

    and('I confirm the deletion', async function () {
      await page.getByRole('button', { name: 'Apagar', exact: true }).click();
      await expect(page).toHaveURL('http://127.0.0.1:5173/');
    });

    then('I should see the bills list with no bills', async function () {
      await expect(page.getByText('Conta apagada')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Nenhuma conta ainda' })).toBeVisible();
    });
  });
});
