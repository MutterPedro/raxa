import { inject, tagged } from 'inversify';
import { UserProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import type { DBConnection } from '../../infra/DBConnection';
import User from '../entities/User';
import { WithId } from '../../@types/utils';

export class UserRepository extends BaseRepository<User, UserProps> {
  private static LOGGED_USER_ID: number;

  @inject(TYPES.DBConnection)
  @tagged('entity', User.name)
  declare protected readonly dbConnection: DBConnection<UserProps>;

  fromPlainObject(data: WithId<UserProps>): WithId<User> {
    const user = new User();
    user.id = data.id;
    user.name = data.name;
    user.email = data.email;
    user.logged_in = this.isLogged(data.id);
    return user;
  }

  setLogged(user: User) {
    UserRepository.LOGGED_USER_ID = user.id;
    user.logged_in = true;
  }

  isLogged(id: number): boolean {
    return UserRepository.LOGGED_USER_ID === id;
  }
}
