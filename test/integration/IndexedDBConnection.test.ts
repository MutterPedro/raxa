import { test, expect } from '@playwright/test';

// import { IndexedDBConnection } from '../../src/infra/DBConnection';

test.describe('IndexedDBConnection.ts', function () {
  test('it should add a new entity to IndexedDB', async ({ page }) => {
    await page.goto('http://0.0.0.0:5173/');

    const dbs = await page.evaluate(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const conn = window.conn;
        console.log(conn);
        conn.setUp('Test');

        await conn.add({
          id: '1',
          name: 'test',
        });

        const dbs = await window.indexedDB.databases();
        return dbs;
      } catch (error: unknown) {
        return error;
      }
    });

    expect(dbs[0].name).toBe('test');
  });
});
