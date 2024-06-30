import BaseEntity from '../../../src/core/entities/BaseEntity';
import Expense, { ExpenseProps } from '../../../src/core/entities/Expense';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';

describe('Expense.ts', function () {
  describe('Unit test', function () {
    it('should be an entity #unit', function () {
      const mockedDbConn = new MemoryDBConnection<ExpenseProps>();
      const expense = Expense.buildNullable(mockedDbConn);

      expect(expense).toBeInstanceOf(BaseEntity);
    });

    it('should be saved respecting the fields defined at the migration #unit', async function () {
      const mockedDbConn = new MemoryDBConnection<ExpenseProps>();

      const bill = Expense.buildNullable(mockedDbConn);
      bill.name = 'Chicken Pizza';
      bill.amount = 100;
      bill.date = new Date();
      bill.payerId = 1337;
      bill.participantIds = [123, 321, 1337];
      await bill.save();

      const bill2 = Expense.buildNullable(mockedDbConn);
      bill2.name = 'Juice';
      bill2.amount = 20;
      bill2.date = new Date();
      bill2.payerId = 123;
      bill2.participantIds = [123, 321];
      await bill2.save();

      expect(mockedDbConn.items).toHaveLength(2);
      expect(mockedDbConn.items[0].name).toBe(bill.name);
      expect(mockedDbConn.items[1].name).toBe(bill2.name);
      expect(mockedDbConn.items[0].date).toContain(bill.date.toISOString());
      expect(mockedDbConn.items[1].date).toContain(bill2.date.toISOString());
    });
  });
});
