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
  await expect(page.getByTestId('new-bill-form')).toBeVisible();
  await page.locator('input#date').fill('2026-01-15');
  await capture(page, 'new-bill-form');
});

test('new-bill-form-split', async ({ page }) => {
  await gotoFresh(page);
  await page.getByTestId('new-bill-jumbo-button').click();
  await expect(page.getByTestId('new-bill-form')).toBeVisible();
  await page.locator('input#date').fill('2026-01-15');
  await page.getByTestId('new-bill-form-name-input').fill('Rachado do jantar');
  await page.getByTestId('new-bill-form-amount-input').fill('140.00');
  // Two typed participants become chips; a third typed name leaves the creatable menu
  // open over its create row — the exact state a first-time user hits mid-capture.
  const participantInput = page.locator('#new-bill-form-participant-input');
  for (const name of ['Ana', 'Bruno']) {
    await participantInput.fill(name);
    await participantInput.press('Enter');
  }
  await participantInput.fill('Carla');
  await expect(page.getByText('Adicionar "Carla"')).toBeVisible();
  await capture(page, 'new-bill-form-split', { fullPage: true });
});

test('new-expense-form', async ({ page }) => {
  await gotoSeeded(page, '/bill/1');
  await page.getByTestId('new-expense-button').click();
  await expect(page.getByTestId('new-expense-form-amount-input')).toBeVisible();
  await expect(page.getByText('Eu').first()).toBeVisible();
  await capture(page, 'new-expense-form');
});

test('delete-bill-confirm', async ({ page }) => {
  await gotoSeeded(page, '/bill/1');
  await page.getByTestId('delete-bill-button').click();
  await expect(page.getByRole('dialog', { name: 'Apagar conta?' })).toBeVisible();
  await capture(page, 'delete-bill-confirm');
});

test('toast', async ({ page }) => {
  // Plain variant (message + close only) through the real provider via the test bridge;
  // no shipped flow emits a plain toast today, so the bridge is the only way to pin it.
  await gotoSeeded(page, '/bill/1');
  await page.evaluate(() => window.__notifyToast?.('Não foi possível desfazer', { duration: 0 }));
  await expect(page.getByText('Não foi possível desfazer')).toBeVisible();
  await capture(page, 'toast');
});

test('toast-undo', async ({ page }) => {
  // Action variant in the real flow: quick add leaves the undo toast over the bill detail.
  await gotoSeeded(page, '/bill/1');
  await page.getByTestId('new-expense-button').click();
  await page.getByTestId('new-expense-form-amount-input').fill('30');
  await page.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.getByRole('button', { name: 'Desfazer' })).toBeVisible();
  await capture(page, 'toast-undo');
});

test('login', async ({ page }) => {
  await gotoSeeded(page, '/login');
  await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
  await capture(page, 'login');

  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByLabel('Confirmar senha')).toBeVisible();
  await capture(page, 'login-signup');
});
