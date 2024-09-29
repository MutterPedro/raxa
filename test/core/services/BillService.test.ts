import { BillService } from '../../../src/core/services/BillService';
import { BillRepositoryFake } from '../fakes/BillRepository.fake';

describe('BillService.ts', function () {
  describe('Unit tests', function () {
    it('should add a new bill anonymously #unit', async function () {
      const fakeRepo = BillRepositoryFake.build();
      const service = new BillService(fakeRepo);

      const name = 'test';
      const amount = 100;
      const date = new Date();
      const bill = await service.createBill({ name, amount, date });

      expect(bill).toBeDefined();
      expect(bill.name).toBe(name);
      expect(bill.amount).toBe(amount);
      expect(bill.date).toBe(date);
      expect(bill.ownerId).toBeFalsy();
      expect(bill.id).toBeGreaterThan(0);
      expect(fakeRepo.data).toHaveLength(1);
      expect(fakeRepo.data[0].id).toBe(bill.id);
    });

    it('should add a new bill belonging to a provided user #unit', async function () {
      const fakeRepo = BillRepositoryFake.build();
      const service = new BillService(fakeRepo);

      const name = 'test';
      const amount = 100;
      const ownerId = 1337;
      const bill = await service.createBill({ name, amount, ownerId });

      expect(bill).toBeDefined();
      expect(bill.name).toBe(name);
      expect(bill.amount).toBe(amount);
      expect(bill.ownerId).toBe(ownerId);
      expect(bill.id).toBeGreaterThan(0);
      expect(bill.date).toBeInstanceOf(Date);
      expect(fakeRepo.data).toHaveLength(1);
      expect(fakeRepo.data[0].id).toBe(bill.id);
    });
  });
});
