/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DBConnection } from '../../infra/DBConnection';

import { TABLE_FIELDS } from '../utils/annotations';
import { WithId } from '../../@types/utils';

interface BaseEntity {
  id: number;
}

export class BaseRepository<T extends BaseEntity> {
  constructor(private readonly dbConnection: DBConnection) {}

  toPlainObject(entity: T): object {
    const fields = Reflect.getMetadata(TABLE_FIELDS, entity.constructor);

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

  async save(entity: T): Promise<WithId<T>> {
    if (entity.id <= 0) {
      const { id } = await this.dbConnection.add(this.toPlainObject(entity));

      return { ...entity, id };
    }

    await this.dbConnection.update(entity.id, this.toPlainObject(entity));
    return { ...entity };
  }
}
