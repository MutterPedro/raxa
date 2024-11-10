import { defineFeature, loadFeature } from 'jest-cucumber';
import { chromium, Page, Browser } from '@playwright/test';

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

  test('Creating a valid bill anonymously', ({ given, when, then, and, pending }) => {
    given('I am in the home page', async () => {
      try {
        await page.goto('http://0.0.0.0:5173/');
      } catch (error: unknown) {
        if (error instanceof Error) {
          browser.close({ reason: `Fail to go to the home page: ${error.message}` });
        }

        throw error;
      }
    });

    and('I click in the create bill button', async function () {
      pending();
    });

    when(/^I enter (\d+)\$ as the total amount$/, async function (amount: number) {
      console.log({ amount });
      pending();
    });

    and(/I enter (\w+) as a participant$/, async function (participantName: string) {
      console.log({ participantName });
      pending();
    });

    then(/^I should see a bill row with total (\d+)$/, async function (expectedTotal: number) {
      console.log({ expectedTotal });
      pending();
    });
  });
});
