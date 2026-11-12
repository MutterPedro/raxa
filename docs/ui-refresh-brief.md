# Raxa UI Refresh — standing sub-agent brief

Paste this next to the task card in every executor prompt. Full plan: `docs/ui-refresh-plan.md`.

## Context you need

Raxa: offline-first expense-splitting SPA — React 19 + TypeScript + Vite, Dexie (IndexedDB) as primary store,
Firebase for auth/session only. All UI strings are Brazilian Portuguese (PT-BR) and stay PT. UI components reach
services only through the context hooks `useBillService`/`useUserService`, never the DI container directly. The
`/login` form is intentionally fake (D1): do **not** wire auth.

## Commands

- `npm run lint` — ESLint+Prettier; warnings are errors (printWidth 120, single quotes). `npm run format` fixes.
- `npm run build` — tsc (src) + vite build.
- `npm test` — Jest unit (jsdom). One file: `npx jest test/core/services/BillService.test.ts`; by name:
  `npx jest -t 'name'`. Tag new unit tests `#unit`.
- `npm run test:bdd` — jest-cucumber acceptance; starts `dev:host` itself, drives headless Chromium at
  `http://127.0.0.1:5173/`. Targeted scenario once a dev server is up:
  `npx jest --testMatch **/*.steps.ts -t '<scenario name>'`.
- `npm run test:integration` — Playwright; auto-starts `dev:host`.
- `npm run test:visual` — golden screenshots (exists from T0.2 on).
- Browser suites need `.env` with `VITE_FIREBASE_*`; plain unit tests run without it (`test/setup.ts` auto-mocks).

## A-TDD protocol (mandatory, every task)

1. **Red first.** Write the failing tests expressing the task behavior, run them, keep the failure output.
2. **Short cycle.** Implement; loop with `npx jest <touched>` (+ targeted BDD scenario when one was written).
3. **Long cycle.** `npm run lint && npm run build && npm test`; add `npm run test:bdd` whenever user flows changed;
   `test:integration` only when the card requires it.
4. **Handoff.** Report → short summary + changed-file list + the **verbatim output tail of every command you
   actually ran** (RED run and each gate). **Never commit**; the user approves and commits each task.

## Evidence rules (hard — violating these fails the task outright)

- A report without verbatim pasted command output is treated as **not executed**. "All tests passed" as prose
  proves nothing; the tail of the run proves everything.
- Never claim to have run anything you didn't run. The orchestrator independently re-runs every gate; a mismatch
  between your report and the re-run is handled as fabrication and the task is rejected without discussion.
- If a gate cannot be run (missing env, missing browser), say exactly that and why — never paper over it.

## Test rules (what gets rejected in review)

- **Current patterns only**: acceptance = English Gherkin `test/acceptance/features/*.feature` + 1:1
  `test/acceptance/steps/*.steps.ts` with `loadFeature`; unit = `test/**/*.test.ts` tagged `#unit` using fakes from
  `test/core/fakes/` (never IndexedDB/Firebase); integration = Playwright `test/integration/` via `window.*` helpers.
- **Assert behavior, never implementation**: visible text, amounts, roles, navigation, enabled/disabled, presence of
  states. Never assert CSS classes, DOM nesting, or styling — goldens cover visuals.
- **No redundancy**: one BDD scenario per user-visible rule; unit tests only for logic BDD can't reach; never
  re-test library behavior. Change existing tests only as part of your red commit when the card says to.
- **Selectors**: new/changed `data-testid` follows `<screen>-<element>[-<id>]`, keyed by **entity id**, never by
  user-supplied names. Prefer testids over CSS `#id` selectors. Keep every existing testid working unless the card
  explicitly renames it (then update its step files in the same commit).
- **Coverage**: `src/core/**` stays ≥95% (branches/functions/lines/statements).

## Do not touch unless the card says so

- `src/core/**` — only core-marked cards; entity field changes need a **new decorator version number** (never edit
  fields under an existing version) and new entity files must be exported from `src/core/entities/index.ts`.
- `init.ts` `window.*` helpers (`createTable`, `doesDbExists`, `getFirebaseSessionManager`) — integration tests call them.
- Hard test contracts: button names `'Criar'` / `'Adicionar'`, display name `'Eu'`, `Total R$ x.xx` / `R$ x.xx`
  strings, title `Raxa`, route `/bill/1` — change only when the card orders it, updating step files in the same red commit.
- No new dependencies unless the card lists them. No commits.

## House style

Mirror surrounding code (naming, structure, comments only when required). **All code, comments, identifiers, and
test names are English** — Portuguese is only for user-facing UI strings (the rendered PT-BR interface). **Never
reference task/phase/decision numbers (T1.3, D4, …) in code comments** — code explains what it does and why; provenance
lives in `docs/`. Test names assert present behavior, never "does not do the old thing". Tailwind
classes stay Tailwind-native (CSS-first tokens in `src/index.css`; before that, don't invent new
hardcoded colors — use `--primary-color`/`--secondary-color`). Browser-driven tests select via `data-testid`; keep
them on components they target.
