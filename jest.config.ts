import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  // inversify v8 and its @inversifyjs/* packages are ESM-only: compile them to CJS for Jest.
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.[cm]?js$': ['ts-jest', { tsconfig: { allowJs: true, esModuleInterop: true } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(?:inversify|@inversifyjs)/)'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./test/setup.ts'],
  collectCoverageFrom: ['src/**/*.{tsx,ts}'],
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
