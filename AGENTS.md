# AGENTS.md

Raxa is an expense-splitting app: React 19 + TypeScript + Vite SPA, offline-first with Dexie (IndexedDB) as the primary data store and Firebase used only for auth/session. UI strings are Portuguese (e.g. the submit button is "Criar").

## Commands

- `npm run dev` — dev server. `npm run dev:host` binds `0.0.0.0:5173`; browser-driven tests hardcode `http://127.0.0.1:5173/` (Firefox rejects `0.0.0.0` as a host), so use `dev:host` when testing against the browser.
- `npm run build` — runs `tsc --project tsconfig.build.json` (src only), then `vite build`. Tailwind is handled by `@tailwindcss/vite` (CSS-first via `src/index.css`; there is no `tailwind.config.js` and no separate CSS build step).
- `npm run lint` — ESLint with `--max-warnings 0`; Prettier violations are lint **errors** (config: `.prettierrc`, printWidth 120, single quotes). `npm run format` fixes them.
- `npm test` — Jest (jsdom + ts-jest). Single file: `npx jest test/core/services/BillService.test.ts`; by name: `npx jest -t 'total of a bill'`.
- `npm run test:coverage` — must stay above the enforced **95% global coverage threshold** (branches/functions/lines/statements) or Jest fails.
- `npm run test:integration` — Playwright (`test/integration/`); auto-starts `dev:host` via `webServer` config and reuses a running one locally.
- `npm run test:bdd` — jest-cucumber acceptance tests; starts `dev:host` itself and drives headless Chromium against it.

Three independent suites that don't overlap:

- **Unit** `test/**/*.test.ts` (excludes `test/integration/` via jest config) — run with `npm test`.
- **Acceptance** `test/acceptance/features/*.feature` + `test/acceptance/steps/*.steps.ts` — only run via `test:bdd` (`.steps.ts` doesn't match Jest's default testMatch).
- **Integration** `test/integration/*.test.ts` — Playwright only; Jest deliberately ignores this directory.

`test:watch` only reruns tests whose **names** contain `#unit` or `#sanity` (test-name-pattern convention — tag new unit tests with `#unit`).

## Setup / env

Requires `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` (no `.env` committed, `.gitignore` excludes `.env*`). `src/infra/env.ts` throws `ConfigError` at import time if any is missing, so dev/build/BDD/integration need them. Plain unit tests are fine without: `test/setup.ts` auto-mocks `src/infra/env` and `src/infra/firebase`.

## Architecture

- `src/core/` — domain, framework-free (no React): entities, repositories (`BaseRepository<TProps>` over a generic `DBConnection<T>`), services (`BillService`, `UserService`).
- `src/infra/` — adapters: `DBConnection.ts` (Dexie), `firebase.ts`, `SessionManager.ts`, `di.ts` (inversify `TYPES` symbols), `inversify.config.ts` (root container/factories), `init.ts` (app bootstrap + test-only `window.*` helpers).
- `src/components/` — React UI. Services reach components via `ServicesProvider` context + `useBillService` / `useUserService` hooks, not by importing the container directly.
- DI uses inversify with decorators (`experimentalDecorators`); `reflect-metadata` must be imported before anything else (see `src/main.tsx` and `test/setup.ts`).

## DB schema gotcha (decorator-driven migrations)

Table schemas are declared on entity classes in `src/core/entities/` via `@table('name')` plus `@field(v, 'x')` / `@auto_increment_field(v, 'x')` / `@unique_field` / `@list_field` from `src/core/utils/decorators/database.ts`. Decorators have import side effects that register a versioned schema in global metadata; `applyMigrations` (`src/infra/migrations/index.ts`) feeds that to Dexie. To add/rename a column, decorate it with a **new version number** — never edit fields under an existing version (old IndexedDB data would mismatch). New entity files must be exported from `src/core/entities/index.ts` or their schema silently won't register.

## Testing gotchas

- Browser-driven tests (acceptance + integration) select UI via `data-testid` (e.g. `new-bill-form-name-input`, `bill-total-1`); keep these attributes on components they target.
- Integration tests call real infra code inside the browser through `page.evaluate`, relying on helpers exposed on `window` by `init()` (`createTable`, `doesDbExists`, `getFirebaseSessionManager`) — renaming them breaks `test/integration/`.
- Unit tests use fakes in `test/core/fakes/*.fake.ts` (repositories, `DBConnection`, `SessionManager`), not IndexedDB/Firebase.
- Pre-commit hook (husky + lint-staged) runs `npm run lint` on staged `.ts/.tsx` and `prettier --check`; commits fail on any warning.
