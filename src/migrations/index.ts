import type Dexie from 'dexie';

export function applyMigrations(db: Dexie) {
  db.version(1).stores({
    bill: '++id, name, ownerId, date, amount',
    expense: '++id, name, billId, *participantIds, payerId, amount, date',
    user: '++id, name, email',
  });
}
