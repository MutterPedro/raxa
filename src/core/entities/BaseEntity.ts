import { DBConnection } from '../../infra/DBConnection';

export default abstract class BaseEntity<T> {
  public id: number = 0;
  constructor(private readonly dbConnection: DBConnection<T>) {}

  protected abstract toPlainObject(): T;

  async save() {
    if (this.id <= 0) {
      const { id } = await this.dbConnection.add(this.toPlainObject());
      this.id = id;
    } else {
      await this.dbConnection.update(this.id, this.toPlainObject());
    }

    return true;
  }
}
