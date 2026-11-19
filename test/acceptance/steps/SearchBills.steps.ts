import { Browser, chromium, Page, expect } from '@playwright/test';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(__dirname + '/../features/SearchBills.feature');

// Playwright assertions retry until timeout, which also rides out the search debounce.
const rows = (page: Page) => page.locator('[data-testid^="bill-item-name-"]');

// The quick-capture form: jumbo button on an empty home, float button once a list exists.
async function createBill(page: Page, name: string, viaJumbo = false): Promise<void> {
  await page.getByTestId(viaJumbo ? 'new-bill-jumbo-button' : 'new-bill-float-button').click();
  await page.getByTestId('new-bill-form-name-input').fill(name);
  await page.getByRole('button', { name: 'Criar' }).click();
}

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

  test('Narrowing and widening the bill list by name', ({ given, when, then, and }) => {
    given('I am in the home page', async function () {
      await page.goto('http://127.0.0.1:5173/');
      await expect(page).toHaveTitle(/raxa/);
    });

    and(/^I have a bill with name "(.*)"$/, async function (name: string) {
      await createBill(page, name, true);
    });

    // jest-cucumber binds one definition per step occurrence, so each repeated And gets its own.
    and(/^I have another bill with name "(.*)"$/, async function (name: string) {
      await createBill(page, name);
    });

    and(/^I have another bill with name "(.*)"$/, async function (name: string) {
      await createBill(page, name);
    });

    then(/^the first bill row should be "(.*)"$/, async function (name: string) {
      await expect(rows(page).first()).toContainText(name);
    });

    when(/^I search for "(.*)"$/, async function (term: string) {
      await page.getByTestId('bills-search-input').fill(term);
    });

    then(/^I should see only the bill named "(.*)"$/, async function (name: string) {
      await expect(rows(page)).toHaveCount(1);
      await expect(rows(page).first()).toContainText(name);
    });

    when('I clear the search', async function () {
      await page.getByTestId('bills-search-input').fill('');
    });

    then(/^I should see (\d+) bill rows$/, async function (count: string) {
      await expect(rows(page)).toHaveCount(Number(count));
    });
  }, 60000);
});
