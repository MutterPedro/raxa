import { test, expect } from '@playwright/test';

import { IndexedDBConnection } from '../../src/infra/DBConnection';

test.describe('IndexedDBConnection.ts', function () {
  test('it should add a new entity to IndexedDB', async ({ page }) => {
    try {
      const connEvalHandle = await page.evaluateHandle(`
        window.conn = new IndexedDBConnection('test');
      `);

      await page.evaluate(async (evalHandle) => {
        const conn = evalHandle as IndexedDBConnection<unknown>;

        conn.add({
          id: '1',
          name: 'test',
        });

        const dbs = await window.indexedDB.databases();

        expect(dbs[0].name).toBe('test');
      }, connEvalHandle);
    } catch (e: unknown) {
      console.error(e);
      test.fail();
    }
  });
});
