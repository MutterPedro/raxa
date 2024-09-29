import { inject } from 'inversify';
import { UserProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import { DBConnection } from '../../infra/DBConnection';
import User from '../entities/User';

export class UserRepository extends BaseRepository<UserProps> {
  constructor(@inject(TYPES.DBConnection) factory: (clazz: object) => DBConnection) {
    super(factory(User));
  }
}
