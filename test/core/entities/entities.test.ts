import '../../../src/core/entities';
import Bill from '../../../src/core/entities/Bill';
import Expense from '../../../src/core/entities/Expense';
import User from '../../../src/core/entities/User';
import { TABLES } from '../../../src/core/utils/decorators/database';

describe('entities', function () {
  describe('Unit tests', function () {
    it('should register all entity schemas for migrations #unit', function () {
      const tables = Reflect.getMetadata(TABLES, globalThis);

      expect(Object.keys(tables).sort()).toEqual(['bill', 'expense', 'user']);

      for (const name of ['bill', 'expense', 'user']) {
        const versions = Object.keys(tables[name]).map(Number);

        expect(versions).toContain(1);
        expect(versions.every((version) => Number.isInteger(version) && version >= 1)).toBe(true);

        for (const schema of Object.values<string>(tables[name])) {
          expect(schema.split(',').every((field) => field.length > 0)).toBe(true);
        }
      }
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
