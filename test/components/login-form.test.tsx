import 'reflect-metadata';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import type { UserService } from '../../src/core/services/UserService';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import LoginForm from '../../src/components/login/LoginForm';
import { createBillServiceFake } from '../core/fakes/BillService.fake';
import { createUserServiceFake } from '../core/fakes/UserService.fake';

// The form is wired, so every render needs the services context; routing is mocked
// (real navigation lives in the acceptance suite).
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function renderLogin(userService: UserService = createUserServiceFake()) {
  return render(
    <ServicesContext.Provider value={{ billService: createBillServiceFake(), userService }}>
      <LoginForm />
    </ServicesContext.Provider>,
  );
}

function fill(field: 'Email' | 'Senha' | 'Confirmar senha' | 'Nome', value: string): void {
  fireEvent.change(screen.getByLabelText(field), { target: { value } });
}

describe('LoginForm', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('renders the account heading #unit', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Acesse sua conta' })).toBeInTheDocument();
  });

  it('renders offline hint text #unit', () => {
    renderLogin();
    expect(screen.getByText('Funciona offline — entre ou crie uma conta para sincronizar.')).toBeInTheDocument();
  });

  it('Email and Senha inputs resolve by label #unit', () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('Confirmar senha and Nome are NOT in document initially #unit', () => {
    renderLogin();
    expect(screen.queryByLabelText('Confirmar senha')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  it('mode tabs reflect the login mode #unit', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'Entrar', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta', pressed: false })).toBeInTheDocument();
  });

  it('clicking the "Criar conta" tab reveals the signup fields #unit', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta', pressed: false }));
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta', pressed: true })).toBeInTheDocument();
  });

  it('clicking the "Entrar" tab goes back to login mode #unit', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta', pressed: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar', pressed: false }));
    expect(screen.queryByLabelText('Confirmar senha')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  it('submit button label flips Entrar ↔ Criar conta with the mode #unit', () => {
    renderLogin();
    expect(screen.getByTestId('login-submit-button')).toHaveTextContent('Entrar');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta', pressed: false }));
    expect(screen.getByTestId('login-submit-button')).toHaveTextContent('Criar conta');
  });

  it('submit button has type="submit" (form-wired) #unit', () => {
    renderLogin();
    expect(screen.getByTestId('login-submit-button')).toHaveAttribute('type', 'submit');
  });

  it('renders "Continuar com Google" as a type="button" #unit', () => {
    renderLogin();
    const googleBtn = screen.getByRole('button', { name: 'Continuar com Google' });
    expect(googleBtn).toHaveAttribute('type', 'button');
  });

  it('logs in with email and password and lands on home #unit', async () => {
    const userService = createUserServiceFake();
    renderLogin(userService);

    fill('Email', 'ana@exemplo.com');
    fill('Senha', 'senhavaid');
    fireEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => expect(userService.login).toHaveBeenCalledWith('ana@exemplo.com', 'senhavaid'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('surfaces wrong credentials in pt-BR and stays put #unit', async () => {
    const userService = createUserServiceFake({ authError: { code: 'auth/wrong-password' } });
    renderLogin(userService);

    fill('Email', 'ana@exemplo.com');
    fill('Senha', 'errada');
    fireEvent.click(screen.getByTestId('login-submit-button'));

    expect(await screen.findByTestId('login-error')).toHaveTextContent('Email ou senha incorretos.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('validates password confirmation before even calling the service #unit', async () => {
    const userService = createUserServiceFake();
    renderLogin(userService);

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' })); // switch segment
    fill('Email', 'ana@exemplo.com');
    fill('Senha', 'senhavaid');
    fill('Confirmar senha', 'outra');
    fill('Nome', 'Ana');
    fireEvent.click(screen.getByTestId('login-submit-button'));

    expect(await screen.findByTestId('login-error')).toHaveTextContent('As senhas não coincidem.');
    expect(userService.signUp).not.toHaveBeenCalled();
  });

  it('signs up with name and lands on home #unit', async () => {
    const userService = createUserServiceFake();
    renderLogin(userService);

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    fill('Email', 'ana@exemplo.com');
    fill('Senha', 'senhavaid');
    fill('Confirmar senha', 'senhavaid');
    fill('Nome', 'Ana');
    fireEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => expect(userService.signUp).toHaveBeenCalledWith('ana@exemplo.com', 'senhavaid', 'Ana'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('logs in through the Google button #unit', async () => {
    const userService = createUserServiceFake();
    renderLogin(userService);

    fireEvent.click(screen.getByRole('button', { name: /Continuar com Google/ }));

    await waitFor(() => expect(userService.loginWithGoogle).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('keeps quiet when the Google popup was simply closed #unit', async () => {
    const userService = createUserServiceFake({ authError: { code: 'auth/popup-closed-by-user' } });
    renderLogin(userService);

    fireEvent.click(screen.getByRole('button', { name: /Continuar com Google/ }));

    await waitFor(() => expect(userService.loginWithGoogle).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByTestId('login-error')).not.toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('clears the error when switching modes #unit', async () => {
    const userService = createUserServiceFake({ authError: { code: 'auth/wrong-password' } });
    renderLogin(userService);

    fill('Email', 'ana@exemplo.com');
    fill('Senha', 'errada');
    fireEvent.click(screen.getByTestId('login-submit-button'));
    expect(await screen.findByTestId('login-error')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta', pressed: false }));
    expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
  });

  it('keeps typed input under control while pending and disables the buttons #unit', async () => {
    let release: () => void = () => {};
    const userService = createUserServiceFake();
    (userService.login as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ id: 1 });
        }),
    );
    renderLogin(userService);

    fill('Email', 'ana@exemplo.com');
    fill('Senha', 'senhavaid');
    fireEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => expect(screen.getByTestId('login-submit-button')).toBeDisabled());
    expect(screen.getByRole('button', { name: /Continuar com Google/ })).toBeDisabled();
    expect(screen.getByTestId('login-submit-button')).toHaveTextContent('Entrando…');

    release();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });
});
