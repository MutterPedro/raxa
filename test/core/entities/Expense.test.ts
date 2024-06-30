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

      const expense = Expense.buildNullable(mockedDbConn);
      expense.name = 'Chicken Pizza';
      expense.amount = 100;
      expense.date = new Date();
      expense.payerId = 1337;
      expense.participantIds = [123, 321, 1337];
      await expense.save();

      const expense2 = Expense.buildNullable(mockedDbConn);
      expense2.name = 'Juice';
      expense2.amount = 20;
      expense2.date = new Date();
      expense2.payerId = 123;
      expense2.participantIds = [123, 321];
      await expense2.save();

      expect(mockedDbConn.items).toHaveLength(2);
      expect(mockedDbConn.items[0].name).toBe(expense.name);
      expect(mockedDbConn.items[1].name).toBe(expense2.name);
      expect(mockedDbConn.items[0].date).toContain(expense.date.toISOString());
      expect(mockedDbConn.items[1].date).toContain(expense2.date.toISOString());
    });
  });
});
