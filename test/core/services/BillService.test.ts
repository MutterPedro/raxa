import casual from 'casual';
import { BillProps, ExpenseProps } from '../../../src/core/entities';
import { BillService } from '../../../src/core/services/BillService';
import { UserService } from '../../../src/core/services/UserService';
import { BillRepositoryFake } from '../fakes/BillRepository.fake';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { ExpenseRepositoryFake } from '../fakes/ExpenseRepository.fake';
import { UserRepositoryFake } from '../fakes/UserRepository.fake';

describe('BillService.ts', function () {
  describe('Unit tests', function () {
    it('should add a new bill anonymously #unit', async function () {
      const conn = MemoryDBConnection.build<BillProps>();
      const fakeRepo = BillRepositoryFake.build(conn);
      const service = new BillService(fakeRepo, ExpenseRepositoryFake.build(), UserRepositoryFake.build());

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
      const fakeRepo = BillRepositoryFake.build(conn);
      const service = new BillService(fakeRepo, ExpenseRepositoryFake.build(), UserRepositoryFake.build());

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

    it('should add a new expense to a bill #unit', async function () {
      const conn = MemoryDBConnection.build<ExpenseProps>();
      const fakeBillRepo = BillRepositoryFake.build();
      const fakeExpenseRepo = ExpenseRepositoryFake.build(conn);
      const fakeUserRepo = UserRepositoryFake.build();
      const service = new BillService(fakeBillRepo, fakeExpenseRepo, fakeUserRepo);

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
      const fakeBillRepo = BillRepositoryFake.build();
      const fakeExpenseRepo = ExpenseRepositoryFake.build();
      const fakeUserRepo = UserRepositoryFake.build();
      const service = new BillService(fakeBillRepo, fakeExpenseRepo, fakeUserRepo);

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
      const fakeBillRepo = BillRepositoryFake.build();
      const fakeExpenseRepo = ExpenseRepositoryFake.build();
      const fakeUserRepo = UserRepositoryFake.build();
      const service = new BillService(fakeBillRepo, fakeExpenseRepo, fakeUserRepo);

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
      const fakeBillRepo = BillRepositoryFake.build();
      const fakeExpenseRepo = ExpenseRepositoryFake.build();
      const fakeUserRepo = UserRepositoryFake.build();
      const userService = new UserService(fakeUserRepo);
      const service = new BillService(fakeBillRepo, fakeExpenseRepo, fakeUserRepo);

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
      const fakeBillRepo = BillRepositoryFake.build();
      const fakeExpenseRepo = ExpenseRepositoryFake.build();
      const fakeUserRepo = UserRepositoryFake.build();
      const userService = new UserService(fakeUserRepo);
      const service = new BillService(fakeBillRepo, fakeExpenseRepo, fakeUserRepo);

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
  });
});
