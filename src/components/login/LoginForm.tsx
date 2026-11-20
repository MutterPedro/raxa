import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import Card from '../common/Card';
import Field from '../common/Field';
import Button from '../common/Button';
import { useUserService } from '../state/useUserService';
import { authErrorMessage, isPopupDismissed } from '../../core/utils/authErrors';

// Google brand identity mark — the fixed four-color artwork is defined by Google's
// brand guidelines and deliberately sits outside the app palette.
const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="h-[18px] w-[18px]">
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
);

const segmentClasses = (active: boolean) =>
  `h-11 flex-1 rounded-[calc(var(--radius-field)-4px)] text-sm font-semibold transition-colors focus-ring ${
    active ? 'bg-surface-raised text-ink shadow-card ring-1 ring-line' : 'text-ink-muted hover:text-ink'
  }`;

const LoginForm: React.FC = () => {
  const userService = useUserService();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const setField =
    (field: keyof typeof values) =>
    (event: React.ChangeEvent<HTMLInputElement>): void =>
      setValues((values) => ({ ...values, [field]: event.target.value }));

  // Every auth action shares the busy/error handling; success always lands on home.
  async function signIn(run: () => Promise<unknown>): Promise<void> {
    setPending(true);
    setError('');
    try {
      await run();
      navigate('/');
    } catch (authError) {
      // Closing the Google popup is a change of mind, not a failure worth a message.
      if (!isPopupDismissed(authError)) setError(authErrorMessage(authError));
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (isSignUp && values.password !== values.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    void signIn(
      isSignUp
        ? () => userService.signUp(values.email, values.password, values.name)
        : () => userService.login(values.email, values.password),
    );
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h2 className="type-display text-3xl text-ink">Acesse sua conta</h2>
      <p className="mt-1 text-sm text-ink-muted">Funciona offline — entre ou crie uma conta para sincronizar.</p>
      <div
        className="mt-6 flex gap-1 rounded-[var(--radius-field)] bg-surface-sunken p-1"
        role="group"
        aria-label="Modo de acesso"
      >
        <button
          type="button"
          aria-pressed={!isSignUp}
          onClick={() => {
            setIsSignUp(false);
            setError('');
          }}
          className={segmentClasses(!isSignUp)}
        >
          Entrar
        </button>
        <button
          type="button"
          aria-pressed={isSignUp}
          onClick={() => {
            setIsSignUp(true);
            setError('');
          }}
          className={segmentClasses(isSignUp)}
        >
          Criar conta
        </button>
      </div>
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field
          label="Email"
          type="email"
          id="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          required
          value={values.email}
          onChange={setField('email')}
        />
        <Field
          label="Senha"
          type="password"
          id="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          value={values.password}
          onChange={setField('password')}
        />
        {isSignUp && (
          <>
            <Field
              label="Confirmar senha"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              required
              value={values.confirmPassword}
              onChange={setField('confirmPassword')}
            />
            <Field
              label="Nome"
              id="name"
              placeholder="Fulano da Silva"
              autoComplete="name"
              required
              value={values.name}
              onChange={setField('name')}
            />
          </>
        )}
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending} data-testid="login-submit-button">
          {isSignUp ? (pending ? 'Criando conta…' : 'Criar conta') : pending ? 'Entrando…' : 'Entrar'}
        </Button>
        {error && (
          <p role="alert" data-testid="login-error" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-muted">ou</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="flex w-full gap-2.5"
        disabled={pending}
        onClick={() => void signIn(() => userService.loginWithGoogle())}
      >
        <GoogleIcon />
        Continuar com Google
      </Button>
    </Card>
  );
};

export default LoginForm;
