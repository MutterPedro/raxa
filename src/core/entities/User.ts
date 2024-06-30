import { DBConnection, IndexedDBConnection } from '../../infra/DBConnection';
import BaseEntity from './BaseEntity';

export interface UserProps {
  name: string;
  email: string;
}

export default class User extends BaseEntity<UserProps> {
  name: string = '';
  email: string = '';

  private constructor(conn: DBConnection<UserProps>) {
    super(conn);
  }

  protected toPlainObject(): UserProps {
    return {
      name: this.name,
      email: this.email,
    };
  }

  static build(): User {
    return new User(new IndexedDBConnection(window.conn, 'user'));
  }

  static buildNullable(conn: DBConnection<UserProps>): User {
    return new User(conn);
  }
}
