import 'reflect-metadata';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LoginForm from '../../src/components/login/LoginForm';

// The submit button is the only button rendered inside the form element.
const submitButton = (container: HTMLElement) =>
  within(container.querySelector('form') as HTMLElement).getByRole('button');

describe('LoginForm', () => {
  it('renders the account heading #unit', () => {
    render(<LoginForm />);
    expect(screen.getByRole('heading', { name: 'Acesse sua conta' })).toBeInTheDocument();
  });

  it('renders offline hint text #unit', () => {
    render(<LoginForm />);
    expect(screen.getByText('Funciona offline — entre ou crie uma conta para sincronizar.')).toBeInTheDocument();
  });

  it('Email and Senha inputs resolve by label #unit', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('Confirmar senha and Nome are NOT in document initially #unit', () => {
    render(<LoginForm />);
    expect(screen.queryByLabelText('Confirmar senha')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  it('mode tabs reflect the login mode #unit', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Entrar', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta', pressed: false })).toBeInTheDocument();
  });

  it('clicking the "Criar conta" tab reveals the signup fields #unit', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta', pressed: false }));
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta', pressed: true })).toBeInTheDocument();
  });

  it('clicking the "Entrar" tab goes back to login mode #unit', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta', pressed: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar', pressed: false }));
    expect(screen.queryByLabelText('Confirmar senha')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  it('submit button label flips Entrar ↔ Criar conta with the mode #unit', () => {
    const { container } = render(<LoginForm />);
    expect(submitButton(container)).toHaveTextContent('Entrar');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta', pressed: false }));
    expect(submitButton(container)).toHaveTextContent('Criar conta');
  });

  it('submit button has type="button" (fake guard) #unit', () => {
    const { container } = render(<LoginForm />);
    expect(submitButton(container)).toHaveAttribute('type', 'button');
  });

  it('renders "Continuar com Google" as a type="button" (fake guard) #unit', () => {
    render(<LoginForm />);
    const googleBtn = screen.getByRole('button', { name: 'Continuar com Google' });
    expect(googleBtn).toHaveAttribute('type', 'button');
  });
});
