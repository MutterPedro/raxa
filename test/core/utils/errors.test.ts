import { ConfigError } from '../../../src/core/utils/errors';

describe('ConfigError', function () {
  describe('Unit tests', function () {
    it('should be an error named ConfigError #unit', function () {
      const error = new ConfigError('missing VITE_FIREBASE_API_KEY');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ConfigError);
      expect(error.name).toBe('ConfigError');
      expect(error.message).toBe('missing VITE_FIREBASE_API_KEY');
    });
  });
});
