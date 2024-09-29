import Bill, { BillProps } from '../../../src/core/entities/Bill';
import { BillRepository } from '../../../src/core/repositories/BillRepository';
import { TABLE_NAME } from '../../../src/core/utils/annotations';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';

describe('Bill.ts', function () {
  describe('Unit test', function () {
    it('should be an entity #unit', function () {
      const bill = new Bill();
      const tableName = Reflect.getMetadata(TABLE_NAME, bill.constructor);

      expect(tableName).toBeDefined();
      expect(tableName.length).toBeGreaterThan(0);
    });

    it('should be saved respecting the fields defined at the migration #unit', async function () {
      const mockedBillDbConn = new MemoryDBConnection<BillProps>();
      const repo = new BillRepository(() => mockedBillDbConn);

      const bill = new Bill();
      bill.name = 'Friends trip';
      bill.amount = 1000;
      bill.date = new Date();
      bill.ownerId = 1337;
      await repo.save(bill);

      const bill2 = new Bill();
      bill2.name = 'Work trip';
      bill2.amount = 2000;
      bill2.date = new Date();
      bill2.ownerId = 123;
      await repo.save(bill2);

      expect(mockedBillDbConn.items).toHaveLength(2);
      expect(mockedBillDbConn.items[0].name).toBe('Friends trip');
      expect(mockedBillDbConn.items[1].name).toBe('Work trip');
      expect(mockedBillDbConn.items[0].date).toContain(bill.date.toISOString());
      expect(mockedBillDbConn.items[1].date).toContain(bill2.date.toISOString());
    });
  });
});