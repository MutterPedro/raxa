import { UserProps } from '../../../src/core/entities';
import { UserRepository } from '../../../src/core/repositories/UserRepository';
import { DBConnection } from '../../../src/infra/DBConnection';
import { MemoryDBConnection } from './DBConnection.fake';

export class UserRepositoryFake extends UserRepository {
  static build(dbConn?: DBConnection<UserProps>): UserRepositoryFake {
    return new UserRepositoryFake(dbConn || new MemoryDBConnection<UserProps>());
  }
}
