import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';

import type { UserService } from '../../src/core/services/UserService';
import { ServicesContext } from '../../src/components/state/ServicesContext';
import SyncHint from '../../src/components/login/SyncHint';
import { createBillServiceFake } from '../core/fakes/BillService.fake';
import { createUserServiceFake } from '../core/fakes/UserService.fake';
import { createUser } from '../factories/entities';

// react-router is ESM-only under jest (same as bills-list/bill-detail); a plain-anchor
// NavLink keeps the href assertion meaningful.
jest.mock('react-router', () => ({
  NavLink: ({ to, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

function renderHint(userService: UserService) {
  return render(
    <ServicesContext.Provider value={{ billService: createBillServiceFake(), userService }}>
      <SyncHint />
    </ServicesContext.Provider>,
  );
}

describe('SyncHint', () => {
  it('offers the login route to logged-out users #unit', async () => {
    renderHint(createUserServiceFake({ loggedIn: false }));

    const hint = await screen.findByTestId('sync-hint');
    expect(hint).toHaveTextContent('Faça login para sincronizar');
    expect(hint).toHaveAttribute('href', '/login');
  });

  it('stays hidden once the user is logged in #unit', async () => {
    const userService = createUserServiceFake({ loggedIn: true });
    renderHint(userService);

    // Wait for the session check to complete, then confirm nothing showed up.
    await waitFor(() => expect(userService.getLoggedUser).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByTestId('sync-hint')).not.toBeInTheDocument();
  });

  it('hides the moment a login is announced, without any reload #unit', async () => {
    const userService = createUserServiceFake({ loggedIn: false });
    renderHint(userService);
    await screen.findByTestId('sync-hint');

    act(() => userService.emitLoggedUser(createUser(1337, 'Eu')));

    expect(screen.queryByTestId('sync-hint')).not.toBeInTheDocument();
  });
});
