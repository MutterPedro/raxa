import { test, expect, type Page } from '@playwright/test';

// End-to-end regression for the session-restore bug (header stuck on "Entrar" and sync
// hint stuck showing after a full page reload). Unit tests cover UserService.restoreSession;
// this pins the wiring around it — async boot ordering, uid binding during signup, and the
// header/sync-hint reading the real logged user (mount fetch AND the logged-user subscription:
// the first assertion runs on an in-app redirect, with no reload in between). The signup
// form drives a firebase account the same way a Google login lands (uid bound to the local
// self row), so the reload paths are equivalent. "Restore must not invent a session" is
// unit-tested; not re-asserted here because a deleted account's cached ID token can briefly
// keep the client-side session alive, making it non-deterministic. Real Firebase as in
// FirebaseSessionManager.test.ts: throwaway account, deleted even on failure, skipped when
// no usable project is configured.

const BASE = 'http://127.0.0.1:5173';
const PASSWORD = '123456';

const FIREBASE_UNAVAILABLE = new Set([
  'auth/api-key-not-valid',
  'auth/invalid-api-key',
  'auth/operation-not-allowed',
  'auth/configuration-not-found',
]);

function throwawayEmail(): string {
  return `test+${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}@email.com`;
}

// Logging in with an email just invented never creates anything: the backend either
// answers invalid-credential (project alive) or an unavailable code (skip the test).
async function skipIfFirebaseUnconfigured(page: Page): Promise<void> {
  const errorCode = await page.evaluate(async (email) => {
    try {
      await window.getFirebaseSessionManager().loginWithPassword(email, PASSWORD);
      return null;
    } catch (error) {
      const match = String(error).match(/auth\/[\w-]+/);
      return match ? match[0] : 'unknown';
    }
  }, throwawayEmail());

  if (errorCode && FIREBASE_UNAVAILABLE.has(errorCode)) {
    test.skip(true, `firebase unavailable (${errorCode})`);
  }
}

// deleteSession deletes the signed-in account outright; a no-op when nobody is.
async function deleteSignedInAccount(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await window
      .getFirebaseSessionManager()
      .deleteSession()
      .catch(() => undefined);
  });
}

test.describe('Session restore', function () {
  test('keeps the user logged in across a full page reload #integration', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await skipIfFirebaseUnconfigured(page);

    try {
      await page.getByRole('button', { name: 'Criar conta' }).click();
      await page.getByLabel('Email').fill(throwawayEmail());
      await page.getByLabel('Senha', { exact: true }).fill(PASSWORD);
      await page.getByLabel('Confirmar senha').fill(PASSWORD);
      await page.getByLabel('Nome').fill('Teste Reload');
      await page.getByTestId('login-submit-button').click();

      // Signed in: the header CTA and the sync hint give way to the session.
      // (The theme toggle guards against a blank page making count(0) vacuous.)
      await expect(page.getByRole('button', { name: 'Alternar tema' })).toBeVisible();
      await expect(page.getByTestId('header-login-link')).toHaveCount(0, { timeout: 15_000 });
      await expect(page.getByTestId('sync-hint')).toHaveCount(0);

      // The reported bug: a reload used to drop everyone back to "Entrar".
      await page.reload();
      await expect(page.getByRole('button', { name: 'Alternar tema' })).toBeVisible();
      await expect(page.getByTestId('header-login-link')).toHaveCount(0);
      await expect(page.getByTestId('sync-hint')).toHaveCount(0);
    } finally {
      await deleteSignedInAccount(page);
    }
  });
});
