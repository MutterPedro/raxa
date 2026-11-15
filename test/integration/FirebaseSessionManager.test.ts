import { test, expect } from '@playwright/test';

test.describe('FirebaseSessionManager', function () {
  test('it should sign up a new user #integration', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');

    const result = await page.evaluate(async () => {
      try {
        const sessionManager = window.getFirebaseSessionManager();
        const email = `test+${crypto.randomUUID()}@email.com`;
        const password = '123456';
        const uid = await sessionManager.signUpWithPassword(email, password);

        await sessionManager.deleteSession();

        return [uid, null];
      } catch (error) {
        const errorStr = String(error);
        const codeMatch = errorStr.match(/auth\/[\w-]+/);
        const code = codeMatch ? codeMatch[0] : 'unknown';
        return [null, { code }];
      }
    });

    const [uid, error] = result as [string | null, { code?: string } | null];
    const FIREBASE_UNAVAILABLE = new Set([
      'auth/api-key-not-valid',
      'auth/invalid-api-key',
      'auth/operation-not-allowed',
      'auth/configuration-not-found',
    ]);

    if (uid === null && error && FIREBASE_UNAVAILABLE.has(error.code as string)) {
      test.skip(true, `Firebase project not configured in this environment (${error.code})`);
    }

    if (uid === null) {
      throw new Error(`Firebase sign-up failed: ${error?.code ?? 'unknown'}`);
    }

    expect(typeof uid).toBe('string');
    expect(uid.length).toBeGreaterThan(0);
  });
});
