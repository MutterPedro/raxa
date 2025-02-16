const globalLocks = new Map<symbol, boolean>();

export function synchronized(timeout: number = 1000, retryDelay: number = 100): MethodDecorator {
  const key = Symbol('locked');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    globalLocks.set(key, false);

    descriptor.value = async function (...args: unknown[]) {
      const attempts = timeout / retryDelay;
      let attempt = 0;

      while (globalLocks.get(key)) {
        await new Promise((resolve, reject) => {
          if (++attempt >= attempts) {
            reject(new Error('Lock Timeout'));
          }
          setTimeout(resolve, retryDelay);
        });
      }

      globalLocks.set(key, true);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        globalLocks.set(key, false);
      }
    };

    return descriptor;
  };
}
