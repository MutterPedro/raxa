import type User from '../../../src/core/entities/User';
import type { UserService } from '../../../src/core/services/UserService';

// Component tests exercise a subset of UserService; the cast lets the fake stand in
// wherever the real service type is expected.
export function createUserServiceFake(options: { users?: User[]; usersById?: Record<number, User> } = {}): UserService {
  const { users = [], usersById = {} } = options;

  return {
    getUsers: jest.fn(async () => users),
    getByIds: jest.fn(async (ids: number[]) => ids.map((id) => usersById[id]).filter(Boolean)),
  } as unknown as UserService;
}
