import { inject, tagged } from 'inversify';

import { UserProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import User from '../entities/User';

import type { WithId } from '../../@types/utils';
import type { DBConnection } from '../../infra/DBConnection';
import type { SessionCredentials, SessionManager } from '../../infra/SessionManager';

export class UserRepository extends BaseRepository<User, UserProps> {
  private static LOGGED_USER_ID: number;

  constructor(
    @inject(TYPES.DBConnection)
    @tagged('entity', User.name)
    protected readonly dbConnection: DBConnection<UserProps>,
    @inject(TYPES.SessionManager)
    protected readonly sessionManager: SessionManager,
  ) {
    super(dbConnection);
  }

  fromPlainObject(data: WithId<UserProps>): WithId<User> {
    const user = new User();
    user.id = data.id;
    user.name = data.name;
    user.email = data.email;
    user.logged_in = this.isLogged(data.id);
    return user;
  }

  async findByEmail(email: string): Promise<WithId<User> | undefined> {
    const [user] = await this.filter({ email });
    return user;
  }

  /** Verifies credentials remotely without touching local rows; throws on failure. */
  authenticateWithPassword(email: string, password: string): Promise<string> {
    return this.sessionManager.loginWithPassword(email, password);
  }

  authenticateWithGoogle(): Promise<SessionCredentials> {
    return this.sessionManager.loginWithGoogle();
  }

  /** Marks a local user as the logged-in one for this session. */
  setLogged(user: WithId<User>): void {
    UserRepository.LOGGED_USER_ID = user.id;
    user.logged_in = true;
  }

  async setLoggedSignUp(user: User, password: string): Promise<void> {
    await this.sessionManager.signUpWithPassword(user.email, password);

    this.setLogged(user);
  }

  private isLogged(id: number): boolean {
    return UserRepository.LOGGED_USER_ID === id;
  }
}
