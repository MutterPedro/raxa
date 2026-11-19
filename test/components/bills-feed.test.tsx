import 'reflect-metadata';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Bill from '../../src/core/entities/Bill';
import type { BillService } from '../../src/core/services/BillService';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import MainContainer from '../../src/components/MainContainer';
import { createBillServiceFake } from '../core/fakes/BillService.fake';
import { createUserServiceFake } from '../core/fakes/UserService.fake';
import { createBill as createEntityBill } from '../factories/entities';

// Same router mock as bills-list.test.tsx: real routing belongs to the acceptance suite.
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  NavLink: ({ to, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

const createBill = (id: number, name: string): Bill =>
  createEntityBill({ id, name, date: new Date(2026, 10, 12), ownerId: 0 });

// A five-bill pool; with billsPageSize 2 the feed must chain pages 2 and 3 to show them all.
const POOL = [1, 2, 3, 4, 5].map((i) => createBill(i, `Conta ${i}`));

function renderMain(billService: BillService) {
  const userService = createUserServiceFake();
  return render(
    <ServicesContext.Provider value={{ billService, userService }}>
      <MainContainer />
    </ServicesContext.Provider>,
  );
}

async function typeInSearch(value: string): Promise<void> {
  fireEvent.change(await screen.findByTestId('bills-search-input'), { target: { value } });
}

describe('Bills infinite feed', () => {
  // jsdom has no IntersectionObserver, so BillsList calls onLoadMore directly and the
  // feed chains deterministically until the (fake) pool is exhausted.
  it('keeps loading pages until every bill is on screen #unit', async () => {
    const billService = createBillServiceFake({ bills: POOL, billsPageSize: 2 });
    renderMain(billService);

    // Page 1 lands first…
    expect(await screen.findByTestId('bill-item-name-1')).toBeInTheDocument();
    // …then the sentinel chains the rest without any user action.
    expect(await screen.findByTestId('bill-item-name-5')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('bills-list-sentinel')).not.toBeInTheDocument());

    expect(billService.getBills).toHaveBeenCalledWith(2, { search: '' });
    expect(billService.getBills).toHaveBeenCalledWith(3, { search: '' });
    expect(billService.getBills).not.toHaveBeenCalledWith(4, { search: '' });
  });

  it('asks the service how many bills match to decide there is more #unit', async () => {
    const billService = createBillServiceFake({ bills: POOL, billsPageSize: 10 });
    renderMain(billService);

    await screen.findByTestId('bill-item-name-5');
    expect(billService.countBills).toHaveBeenCalledWith({ search: '' });
    // 5 bills, all shown: no sentinel at all.
    expect(screen.queryByTestId('bills-list-sentinel')).not.toBeInTheDocument();
  });
});

describe('Bills search', () => {
  // Real timers: the 250 ms debounce is cheaper to wait for than to fake.
  it('debounces typing and refilters by the search term #unit', async () => {
    const billService = createBillServiceFake({ bills: [createBill(1, 'Show da Pizza'), createBill(2, 'Viagem')] });
    renderMain(billService);

    await typeInSearch('pizza');

    await waitFor(() => expect(billService.getBills).toHaveBeenCalledWith(1, { search: 'pizza' }));
    expect(await screen.findByTestId('bill-item-name-1')).toBeInTheDocument();
    expect(screen.queryByTestId('bill-item-name-2')).not.toBeInTheDocument();
  });

  it('shows every bill again once the search is cleared #unit', async () => {
    const billService = createBillServiceFake({ bills: [createBill(1, 'Show da Pizza'), createBill(2, 'Viagem')] });
    renderMain(billService);

    await typeInSearch('pizza');
    await waitFor(() => expect(screen.queryByTestId('bill-item-name-2')).not.toBeInTheDocument());

    await typeInSearch('');
    expect(await screen.findByTestId('bill-item-name-2')).toBeInTheDocument();
  });

  it('says so when nothing matches #unit', async () => {
    const billService = createBillServiceFake({ bills: [createBill(1, 'Show da Pizza')] });
    renderMain(billService);

    await typeInSearch('churrasco');

    expect(await screen.findByText('Nenhuma conta encontrada')).toBeInTheDocument();
    expect(screen.queryByTestId('bill-item-name-1')).not.toBeInTheDocument();
  });

  it('prepends a new bill when it matches the search still on screen #unit', async () => {
    const billService = createBillServiceFake({
      bills: [createBill(1, 'Show da Pizza')],
      createdBillId: 3,
    });
    renderMain(billService);

    await typeInSearch('pizza');
    await waitFor(() => expect(billService.getBills).toHaveBeenCalledWith(1, { search: 'pizza' }));

    fireEvent.click(screen.getByTestId('new-bill-float-button'));
    fireEvent.change(screen.getByTestId('new-bill-form-name-input'), { target: { value: 'Pizza extra' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByTestId('bill-item-name-3')).toHaveTextContent('Pizza extra');
  });

  it('keeps a new bill off the list when it does not match, still confirming it was saved #unit', async () => {
    const billService = createBillServiceFake({
      bills: [createBill(1, 'Show da Pizza')],
      createdBillId: 3,
    });
    renderMain(billService);

    await typeInSearch('pizza');
    await waitFor(() => expect(billService.getBills).toHaveBeenCalledWith(1, { search: 'pizza' }));

    fireEvent.click(screen.getByTestId('new-bill-float-button'));
    fireEvent.change(screen.getByTestId('new-bill-form-name-input'), { target: { value: 'Cinema' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByTestId('saved-chip')).toBeInTheDocument();
    expect(screen.queryByTestId('bill-item-name-3')).not.toBeInTheDocument();
  });
});
