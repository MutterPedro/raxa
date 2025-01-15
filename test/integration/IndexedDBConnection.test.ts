import { test, expect } from '@playwright/test';
import { testWithinBrowser } from './helpers';

test.describe('IndexedDBConnection.ts', function () {
  test('it should add a new entity to IndexedDB #integration', async ({ page }) => {
    const item = await testWithinBrowser(page, async () => {
      try {
        const billTable = window.createTable<{ name: string; owner: number }>('bill');
        const entity = await billTable.add({
          name: 'test',
          owner: 15,
        });

        if (!(await window.doesDbExists('raxa'))) {
          throw new Error('No DB named "raxa" found');
        }

        const bill = await billTable.getById(entity.id);

        return [bill, null];
      } catch (error) {
        return [null, error];
      }
    });

    expect(item?.name).toBe('test');
    expect(item?.owner).toBe(15);
    expect(item?.id).toBe(1);
  });

  test('it should update an entity on IndexedDB #integration', async ({ page }) => {
    const item = await testWithinBrowser(page, async () => {
      try {
        const billTable = window.createTable<{ name: string; owner: number }>('bill');
        const entity = await billTable.add({
          name: 'test',
          owner: 15,
        });

        const rows = await billTable.update(entity.id, { name: 'test2' });
        if (rows <= 0) {
          throw new Error('No rows were updated');
        }

        const updated = await billTable.getById(entity.id);

        return [updated, null];
      } catch (error) {
        return [null, error];
      }
    });

    expect(item?.name).toBe('test2');
    expect(item?.owner).toBe(15);
  });

  test('it should allow 2 different entities using the same connection #integration', async ({ page }) => {
    const result = await testWithinBrowser(page, async () => {
      try {
        const billTable = window.createTable<{ name: string; owner: number }>('bill');
        const bill = await billTable.add({
          name: 'test',
          owner: 15,
        });
        const expenseTable = window.createTable<{ name: string; billId: number; payer: number }>('expense');
        const expense = await expenseTable.add({
          name: 'test expense',
          billId: bill.id,
          payer: 25,
        });

        const item = await billTable.getById(bill.id);
        const item2 = await expenseTable.getById(expense.id);

        return [{ item, item2 }, null];
      } catch (error) {
        return [null, error];
      }
    });

    expect(result?.item?.name).toBe('test');
    expect(result?.item2?.name).toBe('test expense');
  });

  test('it should list and filter an entity from IndexedDB #integration', async ({ page }) => {
    const result = await testWithinBrowser(page, async () => {
      try {
        const billTable = window.createTable<{ name: string; owner: number }>('bill', 15);
        await billTable.add({
          name: 'test',
          owner: 15,
        });
        await billTable.add({
          name: 'test2',
          owner: 15,
        });

        const bills = await billTable.list();

        for (let i = 0; i < 15; i++) {
          await billTable.add({
            name: 'test' + i,
            owner: 15 - i,
          });
        }
        const secondPage = await billTable.list(2);

        return [{ bills, secondPage }, null];
      } catch (error) {
        return [null, error];
      }
    });

    expect(result?.bills.length).toBe(2);
    expect(result?.secondPage.length).toBe(2);
  });
});
