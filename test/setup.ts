/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'reflect-metadata';
import '@testing-library/jest-dom';

import './helpers/assertions';
import { TextEncoder } from 'node:util';
import casual from 'casual';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

//@ts-expect-error
import.meta.env = {};
import.meta.env.MODE = 'test';
import.meta.env.PROD = false;
import.meta.env.VITE_FIREBASE_API_KEY = casual.uuid;
import.meta.env.VITE_FIREBASE_AUTH_DOMAIN = casual.domain;
import.meta.env.VITE_FIREBASE_PROJECT_ID = casual.uuid;
import.meta.env.VITE_FIREBASE_STORAGE_BUCKET = casual.word;
import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID = casual.uuid;
import.meta.env.VITE_FIREBASE_APP_ID = casual.uuid;
