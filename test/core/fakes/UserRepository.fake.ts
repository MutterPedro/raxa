import casual from 'casual';
import { UserProps } from '../../../src/core/entities';
import User from '../../../src/core/entities/User';
import { UserRepository } from '../../../src/core/repositories/UserRepository';
import { DBConnection } from '../../../src/infra/DBConnection';
import { MemoryDBConnection } from './DBConnection.fake';
import { SessionManager } from '../../../src/infra/SessionManager';
import { SessionManagerFake } from './SessionManager.fake';

export class UserRepositoryFake extends UserRepository {
  private constructor(dbConn: DBConnection<UserProps>, sessionManager: SessionManager) {
    super(dbConn, sessionManager);
  }

  static build(dbConn?: DBConnection<UserProps>, sessionManager?: SessionManager): UserRepositoryFake {
    return new UserRepositoryFake(
      dbConn || MemoryDBConnection.build<UserProps>(),
      sessionManager || SessionManagerFake.build(),
    );
  }

  static async buildPopulated(dbConn?: DBConnection<UserProps>, count: number = 1): Promise<UserRepositoryFake> {
    const repo = UserRepositoryFake.build(dbConn);
    for (let i = 0; i < count; i++) {
      const user = new User();
      user.name = casual.name;
      user.email = casual.email;
      await repo.save(user);
    }

    return repo;
  }
}
