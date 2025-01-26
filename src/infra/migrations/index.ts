import Dexie from 'dexie';
import { TABLES } from '../../core/utils/decorators';

import '../../core/entities';

export function applyMigrations(db: Dexie) {
  const tables = Reflect.getMetadata(TABLES, globalThis) || {};
  const versions = new Set<number>();

  for (const tableVersions of Object.values<Record<number, string[]>>(tables)) {
    Object.keys(tableVersions).forEach((version) => versions.add(Number(version)));
  }

  createStores(tables, versions, db);
}

function createStores(tables: { [s: string]: Record<number, string> }, versions: Set<number>, db: Dexie) {
  let storesVersions: { [x: number]: Record<string, string> } = {};
  for (const [table, tableVersions] of Object.entries<Record<number, string>>(tables)) {
    const biggestVersion = Math.max(...Object.keys(tableVersions).map(Number));
    for (const version of versions) {
      // if the table don´t have a version, use the latest one
      const fields = tableVersions[version] || tableVersions[biggestVersion];

      storesVersions[version] = storesVersions[version] || {};
      storesVersions = {
        ...storesVersions,
        [version]: { ...storesVersions[version], [table]: fields },
      };
    }
  }

  Object.entries(storesVersions).forEach(([version, stores]) => {
    db.version(Number(version)).stores(stores);
  });
}
