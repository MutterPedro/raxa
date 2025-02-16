import 'reflect-metadata';
import '@testing-library/jest-dom';

import './helpers/assertions';
import { TextEncoder } from 'node:util';
import casual from 'casual';
import { jest } from '@jest/globals';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

jest.mock('../src/infra/env', () => ({
  IS_PROD: false,
  FIREBASE_API_KEY: casual.uuid,
  FIREBASE_AUTH_DOMAIN: casual.domain,
  FIREBASE_PROJECT_ID: casual.uuid,
  FIREBASE_STORAGE_BUCKET: casual.word,
  FIREBASE_MESSAGING_SENDER_ID: casual.uuid,
  FIREBASE_APP_ID: casual.uuid,
}));

jest.mock('../src/infra/firebase', () => ({
  app: jest.fn(),
}));
