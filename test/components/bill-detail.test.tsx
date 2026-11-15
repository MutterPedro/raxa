import 'reflect-metadata';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { BillService } from '../../src/core/services/BillService';
import type { UserService } from '../../src/core/services/UserService';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import { ToastProvider } from '../../src/components/common/Toast';
import BillDetail from '../../src/components/expense/BillDetail';
import { createBillServiceFake } from '../core/fakes/BillService.fake';
import { createUserServiceFake } from '../core/fakes/UserService.fake';
import { createBill, createExpense, createUser } from '../factories/entities';

// Mock react-router (same pattern as bills-list.test.tsx), with one navigate spy per
// test file: the delete flow assertions check where the component navigates.
const navigateMock = jest.fn();

jest.mock('react-router', () => ({
  useParams: () => ({ billId: '1' }),
  useNavigate: () => navigateMock,
}));

function renderDetail(billService: BillService) {
  const userService: UserService = createUserServiceFake();
  return render(
    <ServicesContext.Provider value={{ billService, userService }}>
      <ToastProvider>
        <BillDetail />
      </ToastProvider>
    </ServicesContext.Provider>,
  );
}

describe('BillDetail', () => {
  it('shows bill name, pt-BR date and the acceptance total text #unit', async () => {
    renderDetail(createBillServiceFake({ bill: createBill(), total: 150.5 }));

    expect(await screen.findByText('Show da Pizza')).toBeInTheDocument();
    expect(screen.getByText('15/01/2026')).toBeInTheDocument();
    const totalSpan = await screen.findByTestId('bill-total-span');
    expect(totalSpan).toHaveTextContent('Total R$ 150,50');
    // The acceptance suite asserts toHaveText, i.e. normalized exact match.
    expect(totalSpan.textContent?.replace(/\s+/g, ' ').trim()).toBe('Total R$ 150,50');
  });

  it('renders expense rows with name, pt-BR date and amount #unit', async () => {
    const expense = createExpense({ name: 'Ingressos', amount: 120.5 });

    renderDetail(createBillServiceFake({ bill: createBill(), expenses: [expense], total: 120.5 }));

    const row = (await screen.findByText('Ingressos')).closest('li');
    expect(row).not.toBeNull();
    expect(row).toHaveTextContent('15/01/2026');
    expect(row).toHaveTextContent('R$ 120,50');
  });

  it('renders division rows with amounts and owes/gets labels #unit', async () => {
    const parts = [
      { amount: -75.25, user: createUser(1337, 'Eu') },
      { amount: 75.25, user: createUser(1, 'Ana') },
    ];
    renderDetail(createBillServiceFake({ bill: createBill(), parts }));

    expect(await screen.findByTestId('bill-part-participant-Ana')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quem fica com quanto' })).toBeInTheDocument();
    expect(screen.getByTestId('bill-part-amount-Eu')).toHaveTextContent('R$ -75,25');
    expect(screen.getByTestId('bill-part-amount-Ana')).toHaveTextContent('R$ 75,25');
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
    const created = createExpense({ id: 2, name: 'Show da Pizza', amount: 60 });
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
    expect(screen.getByTestId('bill-total-span')).toHaveTextContent('Total R$ 60,00');
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

  it('keeps the expense form open with a retry toast when the quick add fails #unit', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const billService = createBillServiceFake({ bill: createBill(), quickAddExpenseFails: true });
    renderDetail(billService);

    fireEvent.click(await screen.findByRole('button', { name: 'Nova despesa' }));
    fireEvent.change(await screen.findByTestId('new-expense-form-amount-input'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    // The failure is reported as a toast and the form stays open for a manual retry
    expect(await screen.findByText('Não foi possível adicionar a despesa')).toBeInTheDocument();
    expect(screen.getByTestId('new-expense-form')).toBeInTheDocument();

    // The toast action re-submits the form as it is, without the user touching it again
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(billService.quickAddExpense).toHaveBeenCalledTimes(2));
    consoleError.mockRestore();
  });

  it('offers Desfazer after a quick add, and undoing removes the expense and refreshes the bill #unit', async () => {
    const created = createExpense({ id: 2, name: 'Pizza extra', amount: 30 });
    const billService = createBillServiceFake({
      bill: createBill(),
      expenses: [],
      total: 50,
      quickAddedExpense: created,
    });
    renderDetail(billService);

    // The detail view remounts when the form opens/closes, so re-query the total each time.
    expect(await screen.findByTestId('bill-total-span')).toHaveTextContent('Total R$ 50,00');

    fireEvent.click(screen.getByRole('button', { name: 'Nova despesa' }));
    fireEvent.change(await screen.findByTestId('new-expense-form-amount-input'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    // The expense lands right away and the toast offers to undo it
    const undo = await screen.findByRole('button', { name: 'Desfazer' });
    expect(await screen.findByText('Pizza extra')).toBeInTheDocument();
    expect(await screen.findByTestId('bill-total-span')).toHaveTextContent('Total R$ 80,00');
    // The write also leaves the on-device reassurance chip on screen
    expect(screen.getByTestId('saved-chip')).toBeInTheDocument();

    fireEvent.click(undo);

    await waitFor(() => expect(billService.deleteExpense).toHaveBeenCalledWith(2));
    await waitFor(() => expect(screen.queryByText('Pizza extra')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('bill-total-span')).toHaveTextContent('Total R$ 50,00'));
    expect(screen.queryByRole('button', { name: 'Desfazer' })).not.toBeInTheDocument();
    // the undo is a write as well — the chip stays
    expect(screen.getByTestId('saved-chip')).toBeInTheDocument();
    // division refetched on mount, after the add and after the undo
    await waitFor(() => expect(billService.getParticipantsParts).toHaveBeenCalledTimes(3));
  });

  it('keeps the expense and reports the error when undoing fails #unit', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const created = createExpense({ id: 2, name: 'Pizza extra', amount: 30 });
    const billService = createBillServiceFake({
      bill: createBill(),
      expenses: [],
      total: 50,
      quickAddedExpense: created,
      deleteExpenseFails: true,
    });
    renderDetail(billService);

    fireEvent.click(await screen.findByRole('button', { name: 'Nova despesa' }));
    expect(await screen.findByTestId('new-expense-form-amount-input')).toBeInTheDocument();
    expect(screen.getByText('Só o valor já basta — o resto vem pronto, e você ajusta à vontade.')).toBeInTheDocument();
    fireEvent.change(await screen.findByTestId('new-expense-form-amount-input'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    const undo = await screen.findByRole('button', { name: 'Desfazer' });
    fireEvent.click(undo);

    await waitFor(() => expect(billService.deleteExpense).toHaveBeenCalledWith(2));
    // nothing is rolled back locally when the delete fails
    expect(screen.getByText('Pizza extra')).toBeInTheDocument();
    expect(await screen.findByText('Não foi possível desfazer')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  describe('deleting a bill', () => {
    beforeEach(() => navigateMock.mockClear());

    async function renderLoadedBill(billService: BillService) {
      renderDetail(billService);
      await screen.findByTestId('bill-total-span');
    }

    it('asks for confirmation before deleting the bill #unit', async () => {
      const billService = createBillServiceFake({ bill: createBill(), total: 100 });
      await renderLoadedBill(billService);

      fireEvent.click(screen.getByTestId('delete-bill-button'));

      expect(screen.getByRole('dialog', { name: 'Apagar conta?' })).toBeInTheDocument();
      expect(
        screen.getByText('Isso apaga a conta e todas as despesas de uma vez — sem como voltar atrás.'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Apagar' })).toBeInTheDocument();
      expect(billService.deleteBill).not.toHaveBeenCalled();
    });

    it('keeps the bill when the confirmation is cancelled #unit', async () => {
      const billService = createBillServiceFake({ bill: createBill(), total: 100 });
      await renderLoadedBill(billService);

      fireEvent.click(screen.getByTestId('delete-bill-button'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(billService.deleteBill).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
      expect(screen.getByTestId('bill-total-span')).toHaveTextContent('Total R$ 100,00');
    });

    it('deletes the bill and returns to the bills list #unit', async () => {
      const billService = createBillServiceFake({ bill: createBill(), total: 100 });
      await renderLoadedBill(billService);

      fireEvent.click(screen.getByTestId('delete-bill-button'));
      fireEvent.click(screen.getByRole('button', { name: 'Apagar' }));

      await waitFor(() => expect(billService.deleteBill).toHaveBeenCalledWith(1));
      expect(navigateMock).toHaveBeenCalledWith('/');
      expect(await screen.findByText('Conta apagada')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('stays on the bill and reports the failure when deleting fails #unit', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const billService = createBillServiceFake({ bill: createBill(), total: 100, deleteBillFails: true });
      await renderLoadedBill(billService);

      fireEvent.click(screen.getByTestId('delete-bill-button'));
      fireEvent.click(screen.getByRole('button', { name: 'Apagar' }));

      expect(await screen.findByText('Não foi possível apagar a conta')).toBeInTheDocument();
      expect(navigateMock).not.toHaveBeenCalled();
      expect(screen.getByTestId('bill-total-span')).toHaveTextContent('Total R$ 100,00');
      consoleError.mockRestore();
    });
  });
});
