import 'reflect-metadata';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../src/components/header/Header';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import { UserService } from '../../src/core/services/UserService';
import { UserRepositoryFake } from '../core/fakes/UserRepository.fake';
import { BillService } from '../../src/core/services/BillService';
import { themeStore } from '../../src/infra/theme';

// Mock react-router NavLink so ESM doesn't break jsdom
jest.mock('react-router', () => ({
  NavLink: ({
    to,
    children,
    className,
    'data-testid': testId,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
  }) => (
    <a href={to} className={className} data-testid={testId}>
      {children}
    </a>
  ),
}));

const resetTheme = () => {
  themeStore.setPreference('system');
  localStorage.removeItem('raxa:theme');
  document.documentElement.classList.remove('dark');
};

describe('Header', () => {
  beforeAll(resetTheme);

  afterEach(resetTheme);

  const buildUserService = (): UserService => {
    const fakeRepo = UserRepositoryFake.build();
    return new UserService(fakeRepo);
  };

  const mockBillService = {} as BillService;

  describe('ThemeToggle', () => {
    it('has accessible name Alternar tema #unit', () => {
      const userService = buildUserService();
      render(
        <ServicesContext.Provider value={{ billService: mockBillService, userService }}>
          <Header />
        </ServicesContext.Provider>,
      );
      expect(screen.getByLabelText('Alternar tema')).toBeInTheDocument();
    });

    it('toggles dark class on documentElement and persists to localStorage #unit', () => {
      const userService = buildUserService();
      render(
        <ServicesContext.Provider value={{ billService: mockBillService, userService }}>
          <Header />
        </ServicesContext.Provider>,
      );

      const toggleBtn = screen.getByLabelText('Alternar tema');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('raxa:theme')).toBeNull();

      fireEvent.click(toggleBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('raxa:theme')).toBe('dark');
    });

    it('shows moon in light mode and sun in dark mode #unit', () => {
      const userService = buildUserService();
      render(
        <ServicesContext.Provider value={{ billService: mockBillService, userService }}>
          <Header />
        </ServicesContext.Provider>,
      );

      expect(screen.getByTestId('theme-toggle-moon')).toBeInTheDocument();
      expect(screen.queryByTestId('theme-toggle-sun')).not.toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Alternar tema'));

      expect(screen.getByTestId('theme-toggle-sun')).toBeInTheDocument();
      expect(screen.queryByTestId('theme-toggle-moon')).not.toBeInTheDocument();
    });

    it('flips back to light on second click #unit', () => {
      const userService = buildUserService();
      render(
        <ServicesContext.Provider value={{ billService: mockBillService, userService }}>
          <Header />
        </ServicesContext.Provider>,
      );

      const toggleBtn = screen.getByLabelText('Alternar tema');

      fireEvent.click(toggleBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      fireEvent.click(toggleBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('raxa:theme')).toBe('light');
    });
  });

  describe('Header composition', () => {
    it('renders wordmark link with text raxa and href / #unit', () => {
      const userService = buildUserService();
      render(
        <ServicesContext.Provider value={{ billService: mockBillService, userService }}>
          <Header />
        </ServicesContext.Provider>,
      );

      const link = screen.getByRole('link', { name: /raxa/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
      expect(link).toHaveTextContent('raxa');
    });

    it('renders login link with text Entrar and correct testid #unit', () => {
      const userService = buildUserService();
      render(
        <ServicesContext.Provider value={{ billService: mockBillService, userService }}>
          <Header />
        </ServicesContext.Provider>,
      );

      const loginLink = screen.getByTestId('header-login-link');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
      expect(loginLink).toHaveTextContent('Entrar');
    });

    it('renders theme toggle button #unit', () => {
      const userService = buildUserService();
      render(
        <ServicesContext.Provider value={{ billService: mockBillService, userService }}>
          <Header />
        </ServicesContext.Provider>,
      );

      expect(screen.getByLabelText('Alternar tema')).toBeInTheDocument();
    });
  });
});
