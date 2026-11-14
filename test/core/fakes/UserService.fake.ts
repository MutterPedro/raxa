import User from '../../../src/core/entities/User';
import type { UserService } from '../../../src/core/services/UserService';

export interface UserServiceFakeOptions {
  users?: User[];
  usersById?: Record<number, User>;
  /** Id for the user returned by createSelf (default: 1337 'Eu'). */
  selfId?: number;
  /** logged_in of the self returned by createSelf (default: false, i.e. logged out). */
  loggedIn?: boolean;
  /** First id handed out by createUser (default: 42). */
  nextId?: number;
}

// Component tests exercise a subset of UserService; the cast lets the fake stand in
// wherever the real service type is expected.
export function createUserServiceFake(options: UserServiceFakeOptions = {}): UserService {
  const { users = [], usersById = {}, selfId = 1337, loggedIn = false, nextId = 42 } = options;

  let nextIdCounter = nextId;
  return {
    getUsers: jest.fn(async () => users),
    getByIds: jest.fn(async (ids: number[]) => ids.map((id) => usersById[id]).filter(Boolean)),
    createSelf: jest.fn(async () => {
      const self = new User();
      self.id = selfId;
      self.name = 'Eu';
      self.email = 'placeholder@email.com';
      self.logged_in = loggedIn;
      return self;
    }),
    createUser: jest.fn(async (values: { name: string; email: string }) => {
      const user = new User();
      user.id = nextIdCounter++;
      user.name = values.name;
      user.email = values.email;
      return user;
    }),
  } as unknown as UserService;
}
