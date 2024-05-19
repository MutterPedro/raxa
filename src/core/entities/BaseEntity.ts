import { DBConnection } from '../../infra/DBConnection';
import { IDGenerator } from '../../infra/IDGenerator';

export default abstract class BaseEntity<T> {
  private readonly id: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  protected readonly fields: string[];

  constructor(
    protected readonly db: DBConnection<T>,
    protected readonly idGenerator: IDGenerator,
    tableName: string,
    fields: string[],
  ) {
    this.id = idGenerator.generate();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.fields = ['id', 'createdAt', 'updatedAt', ...fields];

    this.db.setUp(tableName, fields);
  }

  abstract toPlainObject(): T;

  async save(): Promise<void> {
    const data = this.toPlainObject();

    const result = await this.db.add(data as T);
    console.log(result);
  }
}
