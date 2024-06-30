import BaseEntity from '../../../src/core/entities/BaseEntity';
import Bill, { BillProps } from '../../../src/core/entities/Bill';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';

describe('Bill.ts', function () {
  describe('Unit test', function () {
    it('should be an entity #unit', function () {
      const mockedDbConn = new MemoryDBConnection<BillProps>();
      const user = Bill.buildNullable(mockedDbConn);

      expect(user).toBeInstanceOf(BaseEntity);
    });

    it('should be saved respecting the fields defined at the migration #unit', async function () {
      const mockedBillDbConn = new MemoryDBConnection<BillProps>();

      const bill = Bill.buildNullable(mockedBillDbConn);
      bill.name = 'Friends trip';
      bill.amount = 1000;
      bill.date = new Date();
      bill.ownerId = 1337;
      await bill.save();

      const bill2 = Bill.buildNullable(mockedBillDbConn);
      bill2.name = 'Work trip';
      bill2.amount = 2000;
      bill2.date = new Date();
      bill2.ownerId = 123;
      await bill2.save();

      expect(mockedBillDbConn.items).toHaveLength(2);
      expect(mockedBillDbConn.items[0].name).toBe('Friends trip');
      expect(mockedBillDbConn.items[1].name).toBe('Work trip');
      expect(mockedBillDbConn.items[0].date).toContain(bill.date.toISOString());
      expect(mockedBillDbConn.items[1].date).toContain(bill2.date.toISOString());
    });
  });
});
