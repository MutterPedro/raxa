import { BillProps, ExpenseProps } from '../../../src/core/entities';
import { BillService } from '../../../src/core/services/BillService';
import { BillRepositoryFake } from '../fakes/BillRepository.fake';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { ExpenseRepositoryFake } from '../fakes/ExpenseRepository.fake';

describe('BillService.ts', function () {
  describe('Unit tests', function () {
    it('should add a new bill anonymously #unit', async function () {
      const conn = new MemoryDBConnection<BillProps>();
      const fakeRepo = BillRepositoryFake.build(conn);
      const service = new BillService(fakeRepo, ExpenseRepositoryFake.buildNullable());

      const name = 'test';
      const date = new Date();
      const bill = await service.createBill({ name, date });

      expect(bill).toBeDefined();
      expect(bill.name).toBe(name);
      expect(bill.date).toBe(date);
      expect(bill.ownerId).toBeFalsy();
      expect(bill.id).toBeGreaterThan(0);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].id).toBe(bill.id);
    });

    it('should add a new bill belonging to a provided user #unit', async function () {
      const conn = new MemoryDBConnection<BillProps>();
      const fakeRepo = BillRepositoryFake.build(conn);
      const service = new BillService(fakeRepo, ExpenseRepositoryFake.buildNullable());

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
      const conn = new MemoryDBConnection<BillProps>();
      const conn2 = new MemoryDBConnection<ExpenseProps>();
      const fakeBillRepo = BillRepositoryFake.build(conn);
      const fakeExpenseRepo = ExpenseRepositoryFake.build(conn2);
      const service = new BillService(fakeBillRepo, fakeExpenseRepo);

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
      expect(conn2.items).toHaveLength(1);
      expect(conn2.items[0].id).toBe(expense.id);
    });

    it.each<number>([120, 50])('should calculate the total of a bill #unit', async function (expenseAmount) {
      const conn = new MemoryDBConnection<BillProps>();
      const conn2 = new MemoryDBConnection<ExpenseProps>();
      const fakeBillRepo = BillRepositoryFake.build(conn);
      const fakeExpenseRepo = ExpenseRepositoryFake.build(conn2);
      const service = new BillService(fakeBillRepo, fakeExpenseRepo);

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
      const conn = new MemoryDBConnection<BillProps>();
      const conn2 = new MemoryDBConnection<ExpenseProps>();
      const fakeBillRepo = BillRepositoryFake.build(conn);
      const fakeExpenseRepo = ExpenseRepositoryFake.build(conn2);
      const service = new BillService(fakeBillRepo, fakeExpenseRepo);

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
  });
});
