import type Dexie from 'dexie';

export function applyMigrations(db: Dexie) {
  db.version(1).stores({
    bill: '++id, name, owner',
    expense: '++id, name, billId, *participants, payer',
    user: '++id, name',
  });
}
