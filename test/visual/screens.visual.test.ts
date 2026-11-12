import { expect, test } from '@playwright/test';
import { capture, gotoFresh, gotoSeeded } from './helpers';

test('home-empty', async ({ page }) => {
  await gotoFresh(page);
  await capture(page, 'home-empty');
});

test('home-list', async ({ page }) => {
  await gotoSeeded(page);
  await expect(page.getByTestId('bill-item-name-1')).toBeVisible();
  await expect(page.getByTestId('bill-total-1')).toBeVisible();
  await capture(page, 'home-list');
});

test('bill-detail', async ({ page }) => {
  await gotoSeeded(page, '/bill/1');
  await expect(page.getByTestId('bill-total-span')).toBeVisible();
  await capture(page, 'bill-detail');
});

test('new-bill-form', async ({ page }) => {
  await gotoFresh(page);
  await page.getByTestId('new-bill-jumbo-button').click();
  await expect(page.getByTestId('new-expense-form')).toBeVisible();
  await page.locator('input#date').fill('2026-01-15');
  await capture(page, 'new-bill-form');
});

test('new-expense-form', async ({ page }) => {
  await gotoSeeded(page, '/bill/1');
  await page.getByTestId('new-expense-button').click();
  await expect(page.getByTestId('new-expense-form-amount-input')).toBeVisible();
  await expect(page.getByText('Eu').first()).toBeVisible();
  await capture(page, 'new-expense-form');
});

test('login', async ({ page }) => {
  await gotoSeeded(page, '/login');
  await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
  await capture(page, 'login');

  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByLabel('Confirmar senha')).toBeVisible();
  await capture(page, 'login-signup');
});
