import { injectable } from 'inversify';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';

export interface SessionManager {
  signUpWithPassword(email: string, password: string): Promise<string>;
  deleteSession(): Promise<void>;
}

@injectable()
export class FirebaseSessionManager implements SessionManager {
  async signUpWithPassword(email: string, password: string): Promise<string> {
    const auth = getAuth();
    const creds = await createUserWithEmailAndPassword(auth, email, password);

    return creds.user.uid;
  }

  async deleteSession(): Promise<void> {
    const auth = getAuth();
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
}
