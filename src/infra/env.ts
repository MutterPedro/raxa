class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function requiredEnv(name: string): never {
  throw new ConfigError(`Missing required environment variable "${name}"`);
}

export const IS_PROD: boolean = import.meta.env.PROD;

export const FIREBASE_API_KEY: string = import.meta.env.VITE_FIREBASE_API_KEY || requiredEnv('VITE_FIREBASE_API_KEY');
export const FIREBASE_AUTH_DOMAIN: string =
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || requiredEnv('VITE_FIREBASE_AUTH_DOMAIN');
export const FIREBASE_PROJECT_ID: string =
  import.meta.env.VITE_FIREBASE_PROJECT_ID || requiredEnv('VITE_FIREBASE_PROJECT_ID');
export const FIREBASE_STORAGE_BUCKET: string =
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || requiredEnv('VITE_FIREBASE_STORAGE_BUCKET');
export const FIREBASE_MESSAGING_SENDER_ID: string =
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || requiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID');
export const FIREBASE_APP_ID: string = import.meta.env.VITE_FIREBASE_APP_ID || requiredEnv('VITE_FIREBASE_APP_ID');
