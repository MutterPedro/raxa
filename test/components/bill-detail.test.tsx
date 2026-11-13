import 'reflect-metadata';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Bill from '../../src/core/entities/Bill';
import Expense from '../../src/core/entities/Expense';
import User from '../../src/core/entities/User';
import type { BillService } from '../../src/core/services/BillService';
import type { UserService } from '../../src/core/services/UserService';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import BillDetail from '../../src/components/expense/BillDetail';
import { createBillServiceFake } from '../core/fakes/BillService.fake';
import { createUserServiceFake } from '../core/fakes/UserService.fake';

// Mock react-router (same pattern as bills-list.test.tsx)
jest.mock('react-router', () => ({
  useParams: () => ({ billId: '1' }),
  useNavigate: () => jest.fn(),
}));

const createBill = (): Bill => {
  const bill = new Bill();
  bill.id = 1;
  bill.name = 'Show da Pizza';
  bill.date = new Date(2026, 0, 15);
  bill.ownerId = 1337;
  return bill;
};

const createUser = (id: number, name: string): User => {
  const user = new User();
  user.id = id;
  user.name = name;
  user.email = `${name.toLowerCase()}@raxa.test`;
  return user;
};

function renderDetail(billService: BillService) {
  const userService: UserService = createUserServiceFake();
  return render(
    <ServicesContext.Provider value={{ billService, userService }}>
      <BillDetail />
    </ServicesContext.Provider>,
  );
}

describe('BillDetail', () => {
  it('shows bill name, pt-BR date and the acceptance total text #unit', async () => {
    renderDetail(createBillServiceFake({ bill: createBill(), total: 150.5 }));

    expect(await screen.findByText('Show da Pizza')).toBeInTheDocument();
    expect(screen.getByText('15/01/2026')).toBeInTheDocument();
    const totalSpan = await screen.findByTestId('bill-total-span');
    expect(totalSpan).toHaveTextContent('Total R$ 150.50');
    // The acceptance suite asserts toHaveText, i.e. normalized exact match.
    expect(totalSpan.textContent?.replace(/\s+/g, ' ').trim()).toBe('Total R$ 150.50');
  });

  it('renders expense rows with name, pt-BR date and amount #unit', async () => {
    const expense = new Expense();
    expense.id = 1;
    expense.name = 'Ingressos';
    expense.amount = 120.5;
    expense.date = new Date(2026, 0, 15);
    expense.payerId = 1337;
    expense.participantIds = [1337];

    renderDetail(createBillServiceFake({ bill: createBill(), expenses: [expense], total: 120.5 }));

    const row = (await screen.findByText('Ingressos')).closest('li');
    expect(row).not.toBeNull();
    expect(row).toHaveTextContent('15/01/2026');
    expect(row).toHaveTextContent('R$ 120.50');
  });

  it('renders division rows with amounts and owes/gets labels #unit', async () => {
    const parts = [
      { amount: -75.25, user: createUser(1337, 'Eu') },
      { amount: 75.25, user: createUser(1, 'Ana') },
    ];
    renderDetail(createBillServiceFake({ bill: createBill(), parts }));

    expect(await screen.findByTestId('bill-part-participant-Ana')).toBeInTheDocument();
    expect(screen.getByTestId('bill-part-amount-Eu')).toHaveTextContent('R$ -75.25');
    expect(screen.getByTestId('bill-part-amount-Ana')).toHaveTextContent('R$ 75.25');
    expect(screen.getByText('a receber')).toBeInTheDocument();
    expect(screen.getByText('a pagar')).toBeInTheDocument();
  });

  it('renders the CTA as a button named Nova despesa #unit', async () => {
    renderDetail(createBillServiceFake({ bill: createBill() }));

    expect(await screen.findByRole('button', { name: 'Nova despesa' })).toBeInTheDocument();
  });

  it('opens the expense form with the amount focused and Adicionar disabled until it is positive #unit', async () => {
    renderDetail(createBillServiceFake({ bill: createBill() }));

    fireEvent.click(await screen.findByRole('button', { name: 'Nova despesa' }));

    expect(await screen.findByTestId('new-expense-form')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nova despesa' })).toBeInTheDocument();
    expect(screen.getByTestId('new-expense-form-amount-input')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled();

    fireEvent.change(screen.getByTestId('new-expense-form-amount-input'), { target: { value: '60' } });
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeEnabled();
  });

  it('quick adds an amount-only expense and closes the form when the extra options are hidden #unit', async () => {
    const created = new Expense();
    created.id = 2;
    created.name = 'Show da Pizza';
    created.amount = 60;
    created.date = new Date();
    created.payerId = 1337;
    created.participantIds = [1337];
    const billService = createBillServiceFake({ bill: createBill(), quickAddedExpense: created });
    renderDetail(billService);

    fireEvent.click(await screen.findByRole('button', { name: 'Nova despesa' }));
    await screen.findByTestId('new-expense-form');

    fireEvent.click(screen.getByTestId('new-expense-more-toggle'));
    expect(screen.queryByRole('group', { name: 'Mais opções' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('new-expense-form-amount-input'), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(billService.quickAddExpense).toHaveBeenCalledWith(1, { amount: 60 }));
    // The form closed, the CTA is back and the total picked up the new expense.
    expect(screen.getByRole('button', { name: 'Nova despesa' })).toBeInTheDocument();
    expect(screen.queryByTestId('new-expense-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('bill-total-span')).toHaveTextContent('Total R$ 60.00');
  });

  it('passes the filled-in values of the open options section to the quick add #unit', async () => {
    const billService = createBillServiceFake({ bill: createBill() });
    renderDetail(billService);

    fireEvent.click(await screen.findByRole('button', { name: 'Nova despesa' }));

    // The self preset lands in both selects before the user edits anything.
    await screen.findAllByText('Eu');
    fireEvent.change(screen.getByLabelText('Nome da despesa'), { target: { value: 'Uber' } });
    fireEvent.change(screen.getByTestId('new-expense-form-amount-input'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(billService.quickAddExpense).toHaveBeenCalledWith(1, {
        amount: 30,
        name: 'Uber',
        date: expect.any(Date),
        participantIds: [1337],
        payerId: 1337,
      }),
    );
  });

  it('keeps the expense form open for a retry when the quick add fails #unit', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const billService = createBillServiceFake({ bill: createBill(), quickAddExpenseFails: true });
    renderDetail(billService);

    fireEvent.click(await screen.findByRole('button', { name: 'Nova despesa' }));
    fireEvent.change(await screen.findByTestId('new-expense-form-amount-input'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    expect(screen.getByTestId('new-expense-form')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
