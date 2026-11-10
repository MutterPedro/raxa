import { synchronized } from '../../../src/core/utils/decorators/lock';

function buildSynchronizedService(timeout: number, retryDelay: number, holdMs: number) {
  const calls: string[] = [];

  class TestService {
    @synchronized(timeout, retryDelay)
    async run(marker: string): Promise<string> {
      calls.push(`${marker}:start`);
      await new Promise((resolve) => setTimeout(resolve, holdMs));
      calls.push(`${marker}:end`);
      return `${marker}:done`;
    }
  }

  return { service: new TestService(), calls };
}

describe('synchronized', function () {
  describe('Unit tests', function () {
    it('should run a non-contended call right away #unit', async function () {
      const { service, calls } = buildSynchronizedService(1000, 10, 1);

      await expect(service.run('a')).resolves.toBe('a:done');
      expect(calls).toEqual(['a:start', 'a:end']);
    });

    it('should wait for the lock to be released before running #unit', async function () {
      const { service, calls } = buildSynchronizedService(5000, 5, 30);

      const results = await Promise.all([service.run('first'), service.run('second')]);

      expect(results).toEqual(['first:done', 'second:done']);
      // the calls must be serialized, never interleaved
      expect(calls).toEqual(['first:start', 'first:end', 'second:start', 'second:end']);
    });

    it('should reject with a lock timeout when the lock is held for too long #unit', async function () {
      const { service } = buildSynchronizedService(40, 10, 300);

      const holding = service.run('holder');
      await expect(service.run('impatient')).rejects.toThrow('Lock Timeout');
      await holding;
    });
  });
});
