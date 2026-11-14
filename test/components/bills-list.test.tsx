import 'reflect-metadata';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Bill from '../../src/core/entities/Bill';
import User from '../../src/core/entities/User';
import type { BillService } from '../../src/core/services/BillService';
import type { UserService } from '../../src/core/services/UserService';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import BillsList from '../../src/components/expense/BillsList';
import MainContainer from '../../src/components/MainContainer';
import { createBillServiceFake } from '../core/fakes/BillService.fake';
import { createUserServiceFake } from '../core/fakes/UserService.fake';
import { createBill as createEntityBill, createUser } from '../factories/entities';

// Mock react-router useNavigate so ESM doesn't break jsdom (same pattern as header.test.tsx);
// real routing is covered by the acceptance suite.
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  // MainContainer renders SyncHint, which uses a NavLink; a plain anchor keeps it renderable.
  NavLink: ({ to, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// Every list test uses the same anonymous travel bill; only id and name vary.
const createBill = (id: number, name: string): Bill =>
  createEntityBill({ id, name, date: new Date(2026, 10, 12), ownerId: 0 });

const createUsers = (names: string[]): User[] => names.map((name, i) => createUser(i + 1, name));

function renderWithProviders(ui: React.ReactNode, billService: BillService = createBillServiceFake()) {
  const userService: UserService = createUserServiceFake();
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <ServicesContext.Provider value={{ billService, userService }}>{children}</ServicesContext.Provider>
    ),
  });
}

describe('BillsList', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('renders a skeleton list while loading #unit', () => {
    renderWithProviders(<BillsList bills={[]} isLoading />);

    expect(screen.getByTestId('bills-list-skeleton')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('bill-item-name-1')).not.toBeInTheDocument();
  });

  it('renders bill name and total #unit', async () => {
    const billService = createBillServiceFake({ total: 1234.56 });
    renderWithProviders(<BillsList bills={[createBill(1, 'Viagem')]} />, billService);

    expect(await screen.findByTestId('bill-item-name-1')).toHaveTextContent('Viagem');
    await waitFor(() => expect(screen.getByTestId('bill-total-1')).toHaveTextContent('R$ 1234.56'));
  });

  it('meta line shows the pt-BR date and participants as avatar initials #unit', async () => {
    const billService = createBillServiceFake({ participants: createUsers(['Ana', 'Bia']) });
    renderWithProviders(<BillsList bills={[createBill(1, 'Viagem')]} />, billService);

    expect(await screen.findByText('12/11/2026')).toBeInTheDocument();
    const row = (await screen.findByTestId('bill-item-name-1')).closest('button');
    expect(row?.textContent).toContain('A');
    expect(row?.textContent).toContain('B');
  });

  it('row is a keyboard-operable button #unit', async () => {
    renderWithProviders(<BillsList bills={[createBill(1, 'Viagem')]} />);

    expect(await screen.findByRole('button', { name: /Viagem/ })).toBeInTheDocument();
  });

  it('clicking the row navigates to the bill detail #unit', async () => {
    renderWithProviders(<BillsList bills={[createBill(1, 'Viagem')]} />);

    fireEvent.click(await screen.findByTestId('bill-item-name-1'));
    expect(mockNavigate).toHaveBeenCalledWith('/bill/1');
  });

  it('shows a +N chip when there are more than four participants #unit', async () => {
    const billService = createBillServiceFake({
      participants: createUsers(['Ana', 'Bia', 'Caio', 'Duda', 'Eva', 'Fia']),
    });
    renderWithProviders(<BillsList bills={[createBill(1, 'Viagem')]} />, billService);

    expect(await screen.findByText('+2')).toBeInTheDocument();
  });
});

describe('MainContainer', () => {
  it('shows the empty state when there are no bills #unit', async () => {
    renderWithProviders(<MainContainer />);

    expect(await screen.findByText('Nenhuma conta ainda')).toBeInTheDocument();
    expect(screen.getByTestId('new-bill-jumbo-button')).toBeInTheDocument();
    expect(screen.queryByTestId('bills-list-skeleton')).not.toBeInTheDocument();
  });

  it('shows the skeleton while bills are still loading #unit', async () => {
    renderWithProviders(<MainContainer />, createBillServiceFake({ billsPending: true }));

    expect(screen.getByTestId('bills-list-skeleton')).toBeInTheDocument();
  });
});
