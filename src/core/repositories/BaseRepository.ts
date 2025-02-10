/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { DBConnection } from '../../infra/DBConnection';

import { TABLE_FIELDS } from '../utils/decorators';
import { WithId } from '../../@types/utils';
import { injectable } from 'inversify';

interface BaseEntity {
  id: number;
}

@injectable()
export class BaseRepository<T extends BaseEntity, P extends object = object> {
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

  fromPlainObject(data: WithId<P>): WithId<T> {
    //@ts-expect-error
    return data as WithId<T>;
  }

  async save(entity: T): Promise<WithId<T>> {
    if (entity.id <= 0) {
      //@ts-ignore
      delete entity.id;
      const { id } = await this.dbConnection.add(this.toPlainObject(entity));

      return { ...entity, id };
    }

    await this.dbConnection.update(entity.id, this.toPlainObject(entity));
    return { ...entity };
  }

  async list(page: number): Promise<WithId<T>[]> {
    const rawList = await this.dbConnection.list(page);
    return rawList.map((data) => this.fromPlainObject(data));
  }

  async filter(filter: Partial<P>): Promise<WithId<T>[]> {
    const rawList = await this.dbConnection.filter(filter);
    return rawList.map((data) => this.fromPlainObject(data));
  }

  async getById(id: number): Promise<WithId<T> | null> {
    const data = await this.dbConnection.getById(id);
    return data ? this.fromPlainObject(data) : null;
  }
}
