import * as entitiesBarrel from '../../../src/core/entities';
import Bill from '../../../src/core/entities/Bill';
import Expense from '../../../src/core/entities/Expense';
import User from '../../../src/core/entities/User';

describe('entities', function () {
  describe('Unit tests', function () {
    it('should expose the entities through the package barrel #unit', function () {
      expect(entitiesBarrel).toBeDefined();
    });

    it('should build a bill with default values #unit', function () {
      const before = Date.now();
      const bill = new Bill();

      expect(bill.id).toBe(0);
      expect(bill.name).toBe('');
      expect(bill.ownerId).toBe(0);
      expect(bill.date.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('should build an expense with default values #unit', function () {
      const before = Date.now();
      const expense = new Expense();

      expect(expense.id).toBe(0);
      expect(expense.name).toBe('');
      expect(expense.billId).toBe(0);
      expect(expense.participantIds).toEqual([]);
      expect(expense.payerId).toBe(0);
      expect(expense.amount).toBe(0);
      expect(expense.date.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('should build a user with default values #unit', function () {
      const user = new User();

      expect(user.id).toBe(0);
      expect(user.name).toBe('');
      expect(user.email).toBe('');
    });
  });
});
