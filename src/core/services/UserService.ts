import { inject, injectable } from 'inversify';
import { TYPES } from '../../infra/di';
import { UserRepository } from '../repositories/UserRepository';
import User, { UserProps } from '../entities/User';

@injectable()
export class UserService {
  RESERVED_SELF_ID = 1;

  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepo: UserRepository,
  ) {}

  async createUser(values: Omit<UserProps, 'id'>): Promise<User> {
    const user = new User();
    user.name = values.name;
    user.email = values.email;
    return this.userRepo.save(user);
  }

  async createSelf(): Promise<User> {
    const self = await this.userRepo.getById(this.RESERVED_SELF_ID);
    if (self) {
      return self;
    }

    const user = new User();
    user.name = 'Eu';
    user.email = 'placeholder@email.com';
    return this.userRepo.save(user);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepo.list(1);
  }
}
