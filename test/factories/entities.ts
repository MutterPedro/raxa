import Bill from '../../src/core/entities/Bill';
import Expense from '../../src/core/entities/Expense';
import User from '../../src/core/entities/User';

/**
 * Shared entity factories for component tests. Entity classes carry required fields
 * that are usually irrelevant to the behavior under test, so each factory sets
 * sensible defaults and tests override only what they assert. Defaults mirror
 * BillServiceFake's default bill (id 1, 'Show da Pizza').
 */

export function createBill(overrides: Partial<Bill> = {}): Bill {
  const bill = new Bill();
  Object.assign(bill, { id: 1, name: 'Show da Pizza', date: new Date(2026, 0, 15), ownerId: 1337 }, overrides);
  return bill;
}

export function createUser(id: number, name: string, overrides: Partial<User> = {}): User {
  const user = new User();
  Object.assign(user, { id, name, email: `${name.toLowerCase()}@raxa.test` }, overrides);
  return user;
}

export function createExpense(overrides: Partial<Expense> = {}): Expense {
  const expense = new Expense();
  Object.assign(
    expense,
    { id: 1, name: 'Pizza', amount: 50, date: new Date(2026, 0, 15), payerId: 1337, participantIds: [1337] },
    overrides,
  );
  return expense;
}
