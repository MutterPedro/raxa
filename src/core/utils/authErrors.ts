/**
 * Maps Firebase Auth error codes to user-facing Portuguese. Firebase throws
 * `FirebaseError` objects with a stable `code` (`auth/…`), so the mapping stays
 * decoupled from the SDK — and from any browser — keeping it unit-testable.
 */

function authErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === 'string') {
      return code;
    }
  }
  return '';
}

/** The user closed the Google popup: they changed their mind, not an app failure. */
export function isPopupDismissed(error: unknown): boolean {
  const code = authErrorCode(error);
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
}

const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Este email já tem conta — entre em vez de criar.',
  'auth/weak-password': 'Senha muito fraca — use pelo menos 6 caracteres.',
  'auth/invalid-email': 'Email inválido.',
  // Deliberately vague so the screen never reveals which emails have accounts.
  'auth/user-not-found': 'Email ou senha incorretos.',
  'auth/wrong-password': 'Email ou senha incorretos.',
  'auth/invalid-credential': 'Email ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas — espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão — verifique a internet e tente de novo.',
};

const FALLBACK = 'Não foi possível entrar. Tente novamente.';

export function authErrorMessage(error: unknown): string {
  const code = authErrorCode(error);
  // hasOwnProperty so codes like 'constructor' cannot index off the object prototype.
  return Object.prototype.hasOwnProperty.call(MESSAGES, code) ? MESSAGES[code] : FALLBACK;
}
