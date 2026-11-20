import { test, expect, type Page } from '@playwright/test';

// Real-Firebase integration for FirebaseSessionManager, driven through the dev-only
// window.getFirebaseSessionManager() helper. FIRST: every test owns a throwaway
// account, deletes it even when assertions fail, and skips cleanly when the
// environment has no usable Firebase project. The Google popup flow needs a real
// Google account and is verified manually, so it is not covered here.

const PASSWORD = '123456';

const FIREBASE_UNAVAILABLE = new Set([
  'auth/api-key-not-valid',
  'auth/invalid-api-key',
  'auth/operation-not-allowed',
  'auth/configuration-not-found',
]);

type SessionOp = 'sign-up' | 'login' | 'delete';

interface SessionCall {
  result: unknown;
  /** The `auth/…` code when the call rejected, null on success. */
  errorCode: string | null;
}

async function openApp(page: Page): Promise<void> {
  await page.goto('http://127.0.0.1:5173/');
}

function throwawayEmail(): string {
  return `test+${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}@email.com`;
}

// Single in-page runner for every session op: reports either a result or the auth
// error code, so expectation and cleanup paths stay symmetric on this side.
function call(page: Page, op: SessionOp, email = '', password = ''): Promise<SessionCall> {
  return page.evaluate(
    async ({ op, email, password }) => {
      const sessionManager = window.getFirebaseSessionManager();
      try {
        const result =
          op === 'sign-up'
            ? await sessionManager.signUpWithPassword(email, password)
            : op === 'login'
              ? await sessionManager.loginWithPassword(email, password)
              : await sessionManager.deleteSession();
        return { result, errorCode: null };
      } catch (error) {
        const codeMatch = String(error).match(/auth\/[\w-]+/);
        return { result: null, errorCode: codeMatch ? codeMatch[0] : 'unknown' };
      }
    },
    { op, email, password },
  );
}

// Skips (rather than fails) tests that need a configured project, judged on the
// first network-touching call of the test.
function skipIfUnconfigured(session: SessionCall): void {
  if (session.errorCode && FIREBASE_UNAVAILABLE.has(session.errorCode)) {
    test.skip(true, `Firebase project not configured in this environment (${session.errorCode})`);
  }
}

test.describe('FirebaseSessionManager', function () {
  test('it should sign up a new user #integration', async ({ page }) => {
    await openApp(page);
    try {
      const signUp = await call(page, 'sign-up', throwawayEmail(), PASSWORD);
      skipIfUnconfigured(signUp);

      expect(signUp.errorCode).toBeNull();
      expect(typeof signUp.result).toBe('string');
      expect((signUp.result as string).length).toBeGreaterThan(0);
    } finally {
      await call(page, 'delete');
    }
  });

  test('it should log an existing user back in with the same uid #integration', async ({ page }) => {
    await openApp(page);
    const email = throwawayEmail();
    try {
      const signUp = await call(page, 'sign-up', email, PASSWORD);
      skipIfUnconfigured(signUp);

      // NB: deleteSession deletes the account (deleteUser), not just the session —
      // the account must stay alive here for the login to mean "existing user".
      const login = await call(page, 'login', email, PASSWORD);
      expect(login.errorCode).toBeNull();
      expect(login.result).toBe(signUp.result);
    } finally {
      await call(page, 'delete');
    }
  });

  test('it should reject a wrong password for an existing user #integration', async ({ page }) => {
    await openApp(page);
    const email = throwawayEmail();
    try {
      const signUp = await call(page, 'sign-up', email, PASSWORD);
      skipIfUnconfigured(signUp);

      const wrong = await call(page, 'login', email, `wrong-${PASSWORD}`);
      // With email-enumeration protection Firebase reports the vague code; without
      // it, the specific one. Either proves the credentials are checked server-side.
      expect(['auth/wrong-password', 'auth/invalid-credential']).toContain(wrong.errorCode);
    } finally {
      await call(page, 'delete');
    }
  });

  test('it should reject a weak password without creating an account #integration', async ({ page }) => {
    await openApp(page);

    const weak = await call(page, 'sign-up', throwawayEmail(), '123');
    skipIfUnconfigured(weak);
    expect(weak.errorCode).toBe('auth/weak-password');
    // Nothing was created, so there is nothing to clean up.
  });

  test('it should reject an invalid email #integration', async ({ page }) => {
    await openApp(page);

    const invalid = await call(page, 'sign-up', 'not-an-email', PASSWORD);
    skipIfUnconfigured(invalid);
    expect(invalid.errorCode).toBe('auth/invalid-email');
  });

  test('it should reject signing up twice with the same email #integration', async ({ page }) => {
    await openApp(page);
    const email = throwawayEmail();
    try {
      const signUp = await call(page, 'sign-up', email, PASSWORD);
      skipIfUnconfigured(signUp);

      const duplicate = await call(page, 'sign-up', email, PASSWORD);
      expect(duplicate.errorCode).toBe('auth/email-already-in-use');
    } finally {
      await call(page, 'delete');
    }
  });

  test('it should treat deleting an absent session as a no-op #integration', async ({ page }) => {
    await openApp(page);

    // Fresh browser context: nobody is signed in; the guard must swallow both calls.
    const first = await call(page, 'delete');
    skipIfUnconfigured(first);
    const second = await call(page, 'delete');
    expect(second.errorCode).toBeNull();
  });
});
