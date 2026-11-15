import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { brl } from './brl';

const feature = loadFeature(__dirname + '/../features/BillDivisionByParticipants.feature');

defineFeature(feature, (test) => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true, slowMo: 50 });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    page = await context.newPage();
  });
  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Dividing a bill by participants', ({ given, when, then, and }) => {
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

    when(
      /^I add an expense of (\d+)\$ with (.+) as participants and me as the payer to the bill$/,
      async function (amount: string, participants: string) {
        await page.getByTestId('new-expense-button').click();
        await page.getByTestId('new-expense-form-amount-input').fill(amount);
        for (const participant of participants.split(',').filter((p) => p !== 'me')) {
          await page.locator('#new-expense-form-participant-input').fill(participant);
          await page.locator('#new-expense-form-participant-input').press('Enter');
        }
        await page.getByRole('button', { name: 'Adicionar' }).click();

        await expect(page.getByTestId('bill-total-span')).toHaveText(`Total ${brl(Number(amount))}`);
        await expect(page.getByTestId('new-expense-button')).toBeVisible();
      },
    );

    and(
      /^I add another expense of (\d+)\$ with (.+) as participants and (.+) as the payer to the bill$/,
      async function (amount: string, participants: string, payer: string) {
        await page.getByTestId('new-expense-button').click();
        await page.getByTestId('new-expense-form-amount-input').fill(amount);
        for (const participant of participants.split(',').filter((p) => p !== 'me')) {
          await page.locator('#new-expense-form-participant-input').fill(participant);
          await page.locator('#new-expense-form-participant-input').press('Enter');
        }
        await page.locator('#payer').fill(payer);
        await page.locator('#payer').press('Enter');
        await page.getByRole('button', { name: 'Adicionar' }).click();
      },
    );

    then(/^I should get (\d+)\$ for (.+)$/, async function (amount: string, participant: string) {
      await expect(page.getByTestId(`bill-part-amount-${participant}`)).toBeVisible();
      await expect(page.getByTestId(`bill-part-amount-${participant}`)).toHaveText(brl(Number(amount)));
      await expect(page.getByTestId(`bill-part-participant-${participant}`)).toHaveText(participant);
    });

    and(/^I should get (\d+)\$ for (.+)$/, async function (amount: string, participant: string) {
      await expect(page.getByTestId(`bill-part-amount-${participant}`)).toBeVisible();
      await expect(page.getByTestId(`bill-part-amount-${participant}`)).toHaveText(brl(Number(amount)));
      await expect(page.getByTestId(`bill-part-participant-${participant}`)).toHaveText(participant);
    });

    and(/^I should get -(\d+)\$ for me$/, async function (amount: string) {
      await expect(page.getByTestId('bill-part-amount-Eu')).toBeVisible();
      await expect(page.getByTestId('bill-part-amount-Eu')).toHaveText(brl(-Number(amount)));
      await expect(page.getByTestId('bill-part-participant-Eu')).toHaveText('Eu');
    });
  }, 10000);
});
