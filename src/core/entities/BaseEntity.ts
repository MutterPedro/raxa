import { DBConnection } from '../../infra/DBConnection';
import { IDGenerator } from '../../infra/IDGenerator';

export default abstract class BaseEntity<T> {
  protected id: string = '';

  constructor(
    protected readonly db: DBConnection<T>,
    protected readonly idGenerator: IDGenerator,
    tableName: string,
  ) {
    this.db.setUp(tableName);
  }

  abstract toPlainObject(): T;

  async save(): Promise<void> {
    const data = this.toPlainObject();

    if (!this.id || !(await this.db.getById(this.id))) {
      this.id = this.id || this.idGenerator.generate();
      await this.db.add(data as T);
    } else {
      await this.db.update(data as T);
    }
  }
}
