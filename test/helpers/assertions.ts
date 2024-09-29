import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';
import { TABLE_NAME } from '../../src/core/utils/decorators';

const toBeEntity: MatcherFunction = (actual: unknown) => {
  if (typeof actual !== 'object' || actual === null) {
    return {
      pass: false,
      message: () => 'Expected an object',
    };
  }

  const tableName = Reflect.getMetadata(TABLE_NAME, actual.constructor);

  if (!tableName) {
    return {
      pass: false,
      message: () => `Expected ${actual.constructor.name} is an entity`,
    };
  }

  return {
    pass: true,
    message: () => `Expected ${actual.constructor.name} to be an entity`,
  };
};

expect.extend({
  toBeEntity,
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toBeEntity(): void;
  }
  interface Matchers<R> {
    toBeEntity(): R;
  }
}
