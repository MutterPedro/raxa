import casual from 'casual';
import type { SessionCredentials, SessionManager } from '../../../src/infra/SessionManager';

export class SessionManagerFake implements SessionManager {
  credentials: { email: string; password: string }[] = [];
  /** When set, loginWithPassword rejects with this error (e.g. `{ code: 'auth/wrong-password' }`). */
  loginError?: unknown;
  /** Profile returned by loginWithGoogle. */
  googleCreds: SessionCredentials = { email: 'google.user@example.com', name: 'Google User' };
  /** When set, loginWithGoogle rejects with this error. */
  googleError?: unknown;

  static build(): SessionManagerFake {
    return new SessionManagerFake();
  }

  signUpWithPassword(email: string, password: string): Promise<string> {
    this.credentials.push({ email, password });
    return Promise.resolve(`${casual.uuid}-${email}-${password}`);
  }

  loginWithPassword(email: string, password: string): Promise<string> {
    if (this.loginError) {
      return Promise.reject(this.loginError);
    }
    this.credentials.push({ email, password });
    return Promise.resolve(`uid-${email}`);
  }

  loginWithGoogle(): Promise<SessionCredentials> {
    return this.googleError ? Promise.reject(this.googleError) : Promise.resolve(this.googleCreds);
  }

  deleteSession(): Promise<void> {
    return Promise.resolve();
  }
}
