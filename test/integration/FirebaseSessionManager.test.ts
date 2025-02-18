import { test, expect } from '@playwright/test';
import { testWithinBrowser } from './helpers';

test.describe('FirebaseSessionManager', function () {
  test('it should sign up a new user #integration', async ({ page }) => {
    const session = await testWithinBrowser(page, async () => {
      try {
        const sessionManager = window.getFirebaseSessionManager();
        const email = `test+${Math.floor(Math.random() * 1000)}@email.com`;
        const password = '123456';
        const uid = await sessionManager.signUpWithPassword(email, password);

        await sessionManager.deleteSession();

        return [uid, null];
      } catch (error) {
        return [null, error];
      }
    });

    expect(session).toBeDefined();
    expect(session !== '').toBe(true);
  });
});
