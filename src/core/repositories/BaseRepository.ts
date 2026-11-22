/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { DBConnection, ItemPredicate, ListOptions } from '../../infra/DBConnection';

import { TABLE_FIELDS } from '../utils/decorators/database';
import { WithId } from '../../@types/utils';
import { injectable } from 'inversify';

interface BaseEntity {
  id: number;
}

/** Rows with sync status: `synced_at` stays undefined while local changes are pending. */
interface SyncedEntity extends BaseEntity {
  synced_at?: number;
}

function isSynced(entity: BaseEntity): entity is SyncedEntity {
  return 'synced_at' in entity;
}

@injectable()
export abstract class BaseRepository<T extends BaseEntity, P extends object = object> {
  constructor(protected readonly dbConnection: DBConnection<P>) {}

  toPlainObject(entity: T): P {
    const fields = Reflect.getMetadata(TABLE_FIELDS, entity.constructor);

    //@ts-expect-error
    return Array.from<string>(fields).reduce<object>((acc: object, field: string) => {
      //@ts-expect-error
      if (entity[field] instanceof Date) {
        //@ts-expect-error
        acc[field] = entity[field].toISOString();
      } else {
        //@ts-expect-error
        acc[field] = entity[field];
      }

      return acc;
    }, {});
  }

  abstract fromPlainObject(data: WithId<P>): WithId<T>;

  async create(entity: WithId<T>): Promise<WithId<T>> {
    const obj = await this.dbConnection.add(this.toPlainObject(entity));

    return this.fromPlainObject(obj);
  }

  async save(entity: T): Promise<WithId<T>> {
    // A domain write puts the row back to pending sync; only the sync worker
    // ever stamps synced_at again.
    if (isSynced(entity)) {
      entity.synced_at = undefined;
    }

    if (!entity.id || entity.id <= 0) {
      //@ts-ignore
      delete entity.id;
      return this.create(entity);
    }

    await this.dbConnection.update(entity.id, this.toPlainObject(entity));
    const updated = await this.getById(entity.id);
    return updated!;
  }

  async list(page: number, options?: ListOptions): Promise<WithId<T>[]> {
    const rawList = await this.dbConnection.list(page, options);
    return rawList.map((data) => this.fromPlainObject(data));
  }

  /** Paged rows matching an arbitrary predicate, in the same order as `list`. */
  async searchPage(predicate: ItemPredicate<P>, page: number, options?: ListOptions): Promise<WithId<T>[]> {
    const rawList = await this.dbConnection.searchPage(predicate, page, options);
    return rawList.map((data) => this.fromPlainObject(data));
  }

  /** How many rows exist (optionally matching the predicate). */
  count(predicate?: ItemPredicate<P>): Promise<number> {
    return this.dbConnection.count(predicate);
  }

  async filter(filter: Partial<P>): Promise<WithId<T>[]> {
    const rawList = await this.dbConnection.filter(filter);
    return rawList.map((data) => this.fromPlainObject(data));
  }

  async getById(id: number): Promise<WithId<T> | null> {
    const data = await this.dbConnection.getById(id);
    return data ? this.fromPlainObject(data) : null;
  }

  async delete(id: number): Promise<void> {
    await this.dbConnection.delete(id);
  }
}
