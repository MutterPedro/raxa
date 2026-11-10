import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  // inversify v8 and its @inversifyjs/* packages are ESM-only: compile them to CJS for Jest.
  transform: {
    // emitDecoratorMetadata off: unit tests build services/repositories directly with fakes, so
    // nothing reads the design:type metadata, and its emitted `typeof X ? _a : Object` guards
    // would show up as unreachable uncovered branches. importHelpers keeps the remaining
    // __decorate helper inside tslib (uninstrumented) instead of inlining it per file.
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { emitDecoratorMetadata: false, importHelpers: true } }],
    '^.+\\.[cm]?js$': ['ts-jest', { tsconfig: { allowJs: true, esModuleInterop: true } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(?:inversify|@inversifyjs)/)'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./test/setup.ts'],
  // Jest can only instrument code its own suites execute: src/core is unit-tested with fakes,
  // while src/infra + src/components run inside real browsers (test:bdd, test:integration).
  collectCoverageFrom: ['src/core/**/*.{ts,tsx}'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  testTimeout: 30000,
  maxWorkers: 1,
  maxConcurrency: 1,
  reporters: ['default'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/test/integration'],
};

export default config;
