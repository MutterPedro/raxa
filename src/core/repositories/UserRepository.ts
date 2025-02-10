import { inject, tagged } from 'inversify';
import { UserProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import type { DBConnection } from '../../infra/DBConnection';
import User from '../entities/User';

export class UserRepository extends BaseRepository<User, UserProps> {
  @inject(TYPES.DBConnection)
  @tagged('entity', User.name)
  declare protected readonly dbConnection: DBConnection<UserProps>;
}
