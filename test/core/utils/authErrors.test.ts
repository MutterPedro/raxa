import { authErrorMessage, isPopupDismissed } from '../../../src/core/utils/authErrors';

const error = (code: string): unknown => ({ code });

describe('authErrors.ts', function () {
  describe('Unit tests', function () {
    it('should translate known firebase codes to pt-BR #unit', function () {
      expect(authErrorMessage(error('auth/email-already-in-use'))).toBe(
        'Este email já tem conta — entre em vez de criar.',
      );
      expect(authErrorMessage(error('auth/weak-password'))).toContain('6 caracteres');
      expect(authErrorMessage(error('auth/invalid-email'))).toBe('Email inválido.');
      expect(authErrorMessage(error('auth/too-many-requests'))).toContain('Muitas tentativas');
      expect(authErrorMessage(error('auth/network-request-failed'))).toContain('Sem conexão');
    });

    it('should never reveal whether an email has an account #unit', function () {
      const expected = 'Email ou senha incorretos.';
      for (const code of ['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential']) {
        expect(authErrorMessage(error(code))).toBe(expected);
      }
    });

    it('should fall back gracefully on unknown codes and odd values #unit', function () {
      expect(authErrorMessage(error('auth/something-new'))).toBe('Não foi possível entrar. Tente novamente.');
      expect(authErrorMessage('plain string')).toBe('Não foi possível entrar. Tente novamente.');
      expect(authErrorMessage(undefined)).toBe('Não foi possível entrar. Tente novamente.');
      expect(authErrorMessage({ code: 42 })).toBe('Não foi possível entrar. Tente novamente.');
      // A code that names an Object prototype member must not index off the map.
      expect(authErrorMessage(error('constructor'))).toBe('Não foi possível entrar. Tente novamente.');
    });

    it('should recognize a dismissed Google popup #unit', function () {
      expect(isPopupDismissed(error('auth/popup-closed-by-user'))).toBe(true);
      expect(isPopupDismissed(error('auth/cancelled-popup-request'))).toBe(true);
      expect(isPopupDismissed(error('auth/wrong-password'))).toBe(false);
      expect(isPopupDismissed(null)).toBe(false);
    });
  });
});
