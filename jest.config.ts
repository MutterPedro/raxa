import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
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
  testRunner: 'jest-circus/runner',
  reporters: ['default'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/test/integration'],
};

export default config;
