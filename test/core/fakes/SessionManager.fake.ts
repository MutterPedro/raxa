import casual from 'casual';
import { SessionManager } from '../../../src/infra/SessionManager';

export class SessionManagerFake implements SessionManager {
  credentials: { email: string; password: string }[] = [];
  static build(): SessionManagerFake {
    return new SessionManagerFake();
  }

  signUpWithPassword(email: string, password: string): Promise<string> {
    this.credentials.push({ email, password });
    return Promise.resolve(`${casual.uuid}-${email}-${password}`);
  }

  deleteSession(): Promise<void> {
    return Promise.resolve();
  }
}
