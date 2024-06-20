import { test, expect } from '@playwright/test';
import { testWithinBrowser } from './helpers';

test.describe('IndexedDBConnection.ts', function () {
  test('it should add a new entity to IndexedDB #integration', async ({ page }) => {
    const item = await testWithinBrowser(page, async () => {
      try {
        await window.nullable_table.add({
          id: '1',
          name: 'test',
        });
        const item = await window.nullable_table.getById('1');

        if (!(await window.doesDbExists('raxa'))) {
          throw new Error('Not DB named "raxa" found');
        }

        return [item, null];
      } catch (error) {
        return [null, error];
      }
    });

    expect(item.name).toBe('test');
  });
});
