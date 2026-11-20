import { injectable } from 'inversify';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

/** The account identity a sign-in yields: stable uid plus the profile we persist. */
export interface SessionCredentials {
  uid: string;
  email: string;
  name: string;
}

export interface SessionManager {
  signUpWithPassword(email: string, password: string): Promise<string>;
  loginWithPassword(email: string, password: string): Promise<string>;
  loginWithGoogle(): Promise<SessionCredentials>;
  /** The user Firebase still considers signed in (persisted session), if any. */
  getCurrentUser(): Promise<SessionCredentials | null>;
  deleteSession(): Promise<void>;
}

function credentialsOf(user: { uid: string; email: string | null; displayName: string | null }): SessionCredentials {
  return {
    uid: user.uid,
    email: user.email ?? '',
    name: user.displayName ?? user.email ?? '',
  };
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

    return credentialsOf(result.user);
  }

  getCurrentUser(): Promise<SessionCredentials | null> {
    return new Promise((resolve) => {
      const auth = getAuth();
      // Resolves locally from Firebase's persisted session; the listener is
      // one-shot because boot only cares about the initial state.
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user ? credentialsOf(user) : null);
      });
    });
  }

  async deleteSession(): Promise<void> {
    const auth = getAuth();
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
}
