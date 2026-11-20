import { injectable } from 'inversify';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

/** Profile bits the app keeps from a federated (Google) sign-in. */
export interface SessionCredentials {
  email: string;
  name: string;
}

export interface SessionManager {
  signUpWithPassword(email: string, password: string): Promise<string>;
  loginWithPassword(email: string, password: string): Promise<string>;
  loginWithGoogle(): Promise<SessionCredentials>;
  deleteSession(): Promise<void>;
}

@injectable()
export class FirebaseSessionManager implements SessionManager {
  async signUpWithPassword(email: string, password: string): Promise<string> {
    const auth = getAuth();
    const creds = await createUserWithEmailAndPassword(auth, email, password);

    return creds.user.uid;
  }

  async loginWithPassword(email: string, password: string): Promise<string> {
    const auth = getAuth();
    const creds = await signInWithEmailAndPassword(auth, email, password);

    return creds.user.uid;
  }

  async loginWithGoogle(): Promise<SessionCredentials> {
    const auth = getAuth();
    const result = await signInWithPopup(auth, new GoogleAuthProvider());

    return {
      email: result.user.email ?? '',
      name: result.user.displayName ?? result.user.email ?? '',
    };
  }

  async deleteSession(): Promise<void> {
    const auth = getAuth();
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
}
