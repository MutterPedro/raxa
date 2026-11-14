import casual from 'casual';
import { BillProps, ExpenseProps } from '../../../src/core/entities';
import { BillService } from '../../../src/core/services/BillService';
import { UserService } from '../../../src/core/services/UserService';
import { BillRepositoryFake } from '../fakes/BillRepository.fake';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { ExpenseRepositoryFake } from '../fakes/ExpenseRepository.fake';
import { UserRepositoryFake } from '../fakes/UserRepository.fake';

// Every case builds the same service over fakes; only the stores a test inspects and the
// user store it shares with its own UserService differ. Keeps constructor changes from
// touching every case.
function buildBillService(
  options: {
    billConn?: MemoryDBConnection<BillProps>;
    expenseConn?: MemoryDBConnection<ExpenseProps>;
    userService?: UserService;
  } = {},
): BillService {
  return new BillService(
    BillRepositoryFake.build(options.billConn),
    ExpenseRepositoryFake.build(options.expenseConn),
    options.userService ?? new UserService(UserRepositoryFake.build()),
  );
}

describe('BillService.ts', function () {
  describe('Unit tests', function () {
    it('should add a new bill anonymously #unit', async function () {
      const conn = MemoryDBConnection.build<BillProps>();
      const service = buildBillService({ billConn: conn });

      const name = 'test';
      const date = new Date();
      const bill = await service.createBill({ name, date });

      expect(bill).toBeDefined();
      expect(bill.name).toBe(name);
      expect(bill.date.toISOString()).toBe(date.toISOString());
      expect(bill.ownerId).toBeFalsy();
      expect(bill.id).toBeGreaterThan(0);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].id).toBe(bill.id);
    });

    it('should add a new bill belonging to a provided user #unit', async function () {
      const conn = MemoryDBConnection.build<BillProps>();
      const service = buildBillService({ billConn: conn });

      const name = 'test';
      const ownerId = 1337;
      const bill = await service.createBill({ name, ownerId });

      expect(bill).toBeDefined();
      expect(bill.name).toBe(name);
      expect(bill.ownerId).toBe(ownerId);
      expect(bill.id).toBeGreaterThan(0);
      expect(bill.date).toBeInstanceOf(Date);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].id).toBe(bill.id);
    });

    it('should delete a bill #unit', async function () {
      const conn = MemoryDBConnection.build<BillProps>();
      const service = buildBillService({ billConn: conn });

      const bill = await service.createBill({ name: 'to be undone' });
      expect(conn.items).toHaveLength(1);

      await service.deleteBill(bill.id);

      expect(conn.items).toHaveLength(0);
      expect(await service.getById(bill.id)).toBeNull();
    });

    it('should delete an expense #unit', async function () {
      const conn = MemoryDBConnection.build<ExpenseProps>();
      const service = buildBillService({ expenseConn: conn });

      const bill = await service.createBill({ name: 'test' });
      const expense = await service.addExpense(bill.id, {
        name: 'expense',
        amount: 40,
        date: new Date().toISOString(),
        participantIds: [1, 2],
        payerId: 1,
      });
      expect(conn.items).toHaveLength(1);

      await service.deleteExpense(expense.id);

      expect(conn.items).toHaveLength(0);
      expect(await service.getExpenses(bill.id)).toHaveLength(0);
    });

    it('should undo and re-add an expense keeping the bill data consistent #unit', async function () {
      const conn = MemoryDBConnection.build<ExpenseProps>();
      const service = buildBillService({ expenseConn: conn });

      const bill = await service.createBill({ name: 'Camping' });
      await service.addExpense(bill.id, {
        name: 'Firewood',
        amount: 40,
        date: new Date(2026, 0, 15).toISOString(),
        participantIds: [1, 2],
        payerId: 1,
      });
      const second = await service.addExpense(bill.id, {
        name: 'Water',
        amount: 60,
        date: new Date(2026, 0, 15).toISOString(),
        participantIds: [1, 2],
        payerId: 2,
      });

      // What the toast undo does: delete the just-added expense…
      await service.deleteExpense(second.id);
      expect(await service.getTotal(bill.id)).toBe(40);

      // …and what re-adding the very same expense does afterwards — it must land as a
      // fresh expense, not resurrect the deleted row.
      const reAdded = await service.addExpense(bill.id, {
        name: 'Water',
        amount: 60,
        date: new Date(2026, 0, 15).toISOString(),
        participantIds: [1, 2],
        payerId: 2,
      });

      expect(reAdded.id).not.toBe(second.id);
      expect(conn.items).toHaveLength(2);
      expect(await service.getTotal(bill.id)).toBe(100);
    });

    it('should add a new expense to a bill #unit', async function () {
      const conn = MemoryDBConnection.build<ExpenseProps>();
      const service = buildBillService({ expenseConn: conn });

      const bill = await service.createBill({ name: 'test' });
      const expense = await service.addExpense(bill.id, {
        name: 'expense',
        amount: 111,
        date: new Date().toISOString(),
        participantIds: [1, 2],
        payerId: 1,
      });

      expect(expense).toBeTruthy();
      expect(expense.billId).toBe(bill.id);
      expect(expense.amount).toBe(111);
      expect(expense.participantIds).toEqual([1, 2]);
      expect(expense.payerId).toBe(1);
      expect(expense.id).toBeGreaterThan(0);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].id).toBe(expense.id);
    });

    it.each<number>([120, 50])('should calculate the total of a bill #unit', async function (expenseAmount) {
      const service = buildBillService();

      const bill = await service.createBill({ name: 'test' });
      await service.addExpense(bill.id, {
        name: 'expense',
        amount: expenseAmount,
        date: new Date().toISOString(),
        participantIds: [1, 2],
        payerId: 1,
      });

      await service.addExpense(bill.id, {
        name: 'expense2',
        amount: 100,
        date: new Date().toISOString(),
        participantIds: [1, 2, 3],
        payerId: 1,
      });

      expect(await service.getTotal(bill.id)).toBe(100 + expenseAmount);
    });

    it('should list all the expenses of a bill #unit', async function () {
      const service = buildBillService();

      const bill = await service.createBill({ name: 'test' });
      const expense = await service.addExpense(bill.id, {
        name: 'expense',
        amount: 111,
        date: new Date().toISOString(),
        participantIds: [1, 2],
        payerId: 1,
      });
      const expense2 = await service.addExpense(bill.id, {
        name: 'expense2',
        amount: 222,
        date: new Date().toISOString(),
        participantIds: [1, 2],
        payerId: 1,
      });

      const expenses = await service.getExpenses(bill.id);

      expect(expenses).toHaveLength(2);
      expect(expenses[0].name).toEqual(expense.name);
      expect(expenses[1].name).toEqual(expense2.name);
    });

    it.each<string[]>([
      [casual.name, casual.name, casual.name],
      [casual.name, casual.name, casual.name, casual.name],
    ])('should list all the participants of a bill #unit', async function (...userNames: string[]) {
      const userService = new UserService(UserRepositoryFake.build());
      const service = buildBillService({ userService });

      const userIds = (
        await Promise.all(
          userNames.map(async (name) => {
            const user = await userService.createUser({ name, email: casual.email });
            return user;
          }),
        )
      ).map((u) => u.id);

      const bill = await service.createBill({ name: 'test' });
      await service.addExpense(bill.id, {
        name: 'expense',
        amount: 111,
        date: new Date().toISOString(),
        participantIds: userIds.slice(0, 2),
        payerId: 1,
      });

      await service.addExpense(bill.id, {
        name: 'expense2',
        amount: 222,
        date: new Date().toISOString(),
        participantIds: userIds,
        payerId: 1,
      });

      const participants = await service.getParticipants(bill.id);

      expect(participants.map((p) => p.name)).toEqual(userNames);
    });

    it('should list all the participants of a bill with their part of the total #unit', async function () {
      const userService = new UserService(UserRepositoryFake.build());
      const service = buildBillService({ userService });

      const user1 = await userService.createUser({ name: casual.name, email: casual.email });
      const user2 = await userService.createUser({ name: casual.name, email: casual.email });
      const user3 = await userService.createUser({ name: casual.name, email: casual.email });

      const bill = await service.createBill({ name: 'test' });
      await service.addExpense(bill.id, {
        name: casual.title,
        amount: 500,
        date: new Date().toISOString(),
        participantIds: [user1.id, user2.id],
        payerId: user1.id,
      });
      await service.addExpense(bill.id, {
        name: casual.title,
        amount: 300,
        date: new Date().toISOString(),
        participantIds: [user1.id, user2.id, user3.id],
        payerId: user3.id,
      });
      await service.addExpense(bill.id, {
        name: casual.title,
        amount: 150,
        date: new Date().toISOString(),
        participantIds: [user1.id, user2.id, user3.id],
        payerId: user1.id,
      });

      const parts = await service.getParticipantsParts(bill.id);
      expect(parts).toHaveLength(3);

      const sorted = parts.sort((a, b) => a.user.id - b.user.id);
      expect(sorted[0].amount).toBe(-250);
      expect(sorted[1].amount).toBe(400);
      expect(sorted[2].amount).toBe(-150);
    });

    it('should list bills using the default page and an explicit one #unit', async function () {
      const conn = MemoryDBConnection.build<BillProps>();
      const service = buildBillService({ billConn: conn });

      expect(await service.getBills()).toHaveLength(0);

      await service.createBill({ name: casual.name });
      await service.createBill({ name: casual.name });

      expect(await service.getBills()).toHaveLength(2);
      expect(await service.getBills(1)).toHaveLength(2);
    });

    it('should get a bill by its id #unit', async function () {
      const conn = MemoryDBConnection.build<BillProps>();
      const service = buildBillService({ billConn: conn });

      const bill = await service.createBill({ name: 'a very specific bill' });

      const found = await service.getById(bill.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(bill.id);
      expect(found?.name).toBe('a very specific bill');

      expect(await service.getById(99999)).toBeNull();
    });

    it('should ignore participants that no longer exist when listing them #unit', async function () {
      const conn = MemoryDBConnection.build<BillProps>();
      const userService = new UserService(UserRepositoryFake.build());
      const service = buildBillService({ billConn: conn, userService });

      const user = await userService.createUser({ name: casual.name, email: casual.email });
      const bill = await service.createBill({ name: casual.name });
      await service.addExpense(bill.id, {
        name: casual.title,
        amount: 100,
        date: new Date().toISOString(),
        participantIds: [user.id, 999999],
        payerId: user.id,
      });

      const participants = await service.getParticipants(bill.id);
      expect(participants).toHaveLength(1);
      expect(participants[0].id).toBe(user.id);
    });

    it('should quick add an amount-only expense split with every current bill participant #unit', async function () {
      const userService = new UserService(UserRepositoryFake.build());
      const service = buildBillService({ userService });

      const self = await userService.createSelf();
      const friend = await userService.createUser({ name: casual.name, email: casual.email });

      const bill = await service.createBill({ name: 'Camping' });
      await service.addExpense(bill.id, {
        name: casual.title,
        amount: 40,
        date: new Date(2026, 0, 15).toISOString(),
        participantIds: [self.id, friend.id],
        payerId: self.id,
      });

      const before = Date.now();
      const expense = await service.quickAddExpense(bill.id, { amount: 60 });
      const after = Date.now();

      expect(expense.amount).toBe(60);
      expect(expense.participantIds).toEqual([self.id, friend.id]);
      expect(expense.payerId).toBe(self.id);
      expect(expense.name).toBe('Camping');
      expect(expense.date.getTime()).toBeGreaterThanOrEqual(before);
      expect(expense.date.getTime()).toBeLessThanOrEqual(after);
    });

    it('should quick add an amount-only expense to just self when the bill has no expenses #unit', async function () {
      const service = buildBillService();

      const bill = await service.createBill({ name: 'Trip' });
      const expense = await service.quickAddExpense(bill.id, { amount: 25 });

      expect(expense.participantIds).toEqual([1337]);
      expect(expense.payerId).toBe(1337);
      expect(expense.name).toBe('Trip');
    });

    it('should append the payer to a quick added expense when it is not among the bill participants #unit', async function () {
      const userService = new UserService(UserRepositoryFake.build());
      const service = buildBillService({ userService });

      const self = await userService.createSelf();
      const friend = await userService.createUser({ name: casual.name, email: casual.email });
      const outsider = await userService.createUser({ name: casual.name, email: casual.email });

      const bill = await service.createBill({ name: 'Road trip' });
      await service.addExpense(bill.id, {
        name: casual.title,
        amount: 40,
        date: new Date(2026, 0, 15).toISOString(),
        participantIds: [self.id, friend.id],
        payerId: self.id,
      });

      const expense = await service.quickAddExpense(bill.id, { amount: 30, payerId: outsider.id });

      expect(expense.payerId).toBe(outsider.id);
      expect(expense.participantIds).toEqual([self.id, friend.id, outsider.id]);
    });

    it('should keep every explicitly provided value of a quick added expense #unit', async function () {
      const userService = new UserService(UserRepositoryFake.build());
      const service = buildBillService({ userService });

      const friend = await userService.createUser({ name: casual.name, email: casual.email });
      const bill = await service.createBill({ name: 'Concert' });

      const date = new Date(2025, 4, 4, 10, 30);
      const expense = await service.quickAddExpense(bill.id, {
        amount: 12.5,
        name: '  Train tickets  ',
        date,
        participantIds: [friend.id],
        payerId: friend.id,
      });

      expect(expense.amount).toBe(12.5);
      expect(expense.name).toBe('Train tickets');
      expect(expense.date.toISOString()).toBe(date.toISOString());
      expect(expense.participantIds).toEqual([friend.id]);
      expect(expense.payerId).toBe(friend.id);
    });

    it('should quick add an amount-only expense with a blank name when the bill does not exist #unit', async function () {
      const service = buildBillService();

      const expense = await service.quickAddExpense(99999, { amount: 5 });

      expect(expense.name).toBe('');
      expect(expense.participantIds).toEqual([1337]);
      expect(expense.payerId).toBe(1337);
    });
  });
});
