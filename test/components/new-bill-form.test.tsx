import 'reflect-metadata';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { BillService } from '../../src/core/services/BillService';
import type { UserService } from '../../src/core/services/UserService';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import MainContainer from '../../src/components/MainContainer';
import { createBillServiceFake } from '../core/fakes/BillService.fake';
import { createUserServiceFake } from '../core/fakes/UserService.fake';

// BillItem navigates (same house pattern as the other component suites).
jest.mock('react-router', () => ({
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}));

const SPLIT_GROUP_NAME = 'Divisão da primeira despesa';

// user-event is not a dependency of this repo; fireEvent drives these plain inputs.
async function openQuickCapture() {
  // The home renders a skeleton until the (async) bills load, then the empty state.
  fireEvent.click(await screen.findByTestId('new-bill-jumbo-button'));
}

function renderMain(
  billService: BillService = createBillServiceFake(),
  userService: UserService = createUserServiceFake(),
) {
  return render(
    <ServicesContext.Provider value={{ billService, userService }}>
      <MainContainer />
    </ServicesContext.Provider>,
  );
}

describe('New bill quick-capture', () => {
  it('renders the quick-capture card with the split section hidden until an amount is entered #unit', async () => {
    renderMain();
    await openQuickCapture();

    expect(screen.getByRole('heading', { name: 'Nova conta' })).toBeInTheDocument();
    expect(screen.getByTestId('new-bill-form-name-input')).toBeInTheDocument();
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    expect(screen.getByLabelText('Data')).toHaveValue(today);
    expect(screen.queryByRole('group', { name: SPLIT_GROUP_NAME })).not.toBeInTheDocument();
  });

  it('reveals the split section when an amount is entered #unit', async () => {
    renderMain();
    await openQuickCapture();

    fireEvent.change(screen.getByTestId('new-bill-form-amount-input'), { target: { value: '40' } });

    const group = await screen.findByRole('group', { name: SPLIT_GROUP_NAME });
    expect(group).toBeInTheDocument();
  });

  it('creates the bill without an expense when the amount is left blank #unit', async () => {
    const billService = createBillServiceFake();
    renderMain(billService);
    await openQuickCapture();

    fireEvent.change(screen.getByTestId('new-bill-form-name-input'), { target: { value: 'Solo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() =>
      expect(billService.createBill).toHaveBeenCalledWith(expect.objectContaining({ name: 'Solo', ownerId: 0 })),
    );
    expect(billService.addExpense).not.toHaveBeenCalled();
    // The bill row only renders once the form closed and the list took over.
    expect(await screen.findByTestId('bill-item-name-1')).toBeInTheDocument();
    expect(screen.queryByTestId('new-bill-form')).not.toBeInTheDocument();
  });

  it('creates the bill and the first expense in one submit when an amount is entered #unit', async () => {
    const billService = createBillServiceFake();
    renderMain(billService);
    await openQuickCapture();

    fireEvent.change(screen.getByTestId('new-bill-form-name-input'), { target: { value: 'Party' } });
    fireEvent.change(screen.getByTestId('new-bill-form-amount-input'), { target: { value: '40' } });

    // Preset self (from createSelf) shows up selected in both split selects.
    await screen.findByRole('group', { name: SPLIT_GROUP_NAME });
    expect((await screen.findAllByText('Eu')).length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByTestId('bill-item-name-1')).toBeInTheDocument();
    expect(billService.createBill).toHaveBeenCalledWith(expect.objectContaining({ name: 'Party', ownerId: 0 }));
    expect(billService.addExpense).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Party', amount: 40, participantIds: [1337], payerId: 1337 }),
    );
  });

  it('fails the whole submit when the first expense cannot be created #unit', async () => {
    const billService = createBillServiceFake({ addExpenseFails: true });
    renderMain(billService);
    await openQuickCapture();

    fireEvent.change(screen.getByTestId('new-bill-form-name-input'), { target: { value: 'Fail' } });
    fireEvent.change(screen.getByTestId('new-bill-form-amount-input'), { target: { value: '10' } });

    await screen.findByRole('group', { name: SPLIT_GROUP_NAME });
    await screen.findAllByText('Eu');

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    // The bill exists only to hold expenses: it is rolled back and the form stays open.
    await waitFor(() => expect(billService.deleteBill).toHaveBeenCalledWith(1));
    expect(screen.queryByTestId('bill-item-name-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('new-bill-form')).toBeInTheDocument();
  });
});
