# Contributing to Raxa

Contributions of any kind are welcome — code, tests, design, translations, bug reports,
or ideas. This guide gets you from clone to pull request.

## Ground rules

- **Offline-first is non-negotiable**: nothing may block first paint or core flows on
  the network. Firebase is session-only; the app must stay fully usable logged out
  and offline.
- **Code in English, UI in Brazilian Portuguese.** Identifiers, comments, tests and
  docs are English; user-facing strings are PT-BR.
- **Test-driven**: features/fixes land with failing tests first. Domain logic
  (`src/core/`) is unit-tested; user flows get an acceptance scenario; anything
  visible gets a visual golden.
- `AGENTS.md` is the working map of the repo — read it before touching architecture,
  tests or the design system.

## Environment

- Node `>=22.22.1` (see `engines`) + npm.
- `uv` (Python) only if you regenerate brand assets (`npm run assets`).
- Playwright browsers: `npx playwright install chromium firefox` (+ webkit for visual).

Create a `.env` with a Firebase project (used for auth only — any project works for
development; `src/infra/env.ts` fails fast when values are missing):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Day-to-day commands

| Command                           | What it does                                                           |
| --------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev` / `dev:host`        | Dev server (`dev:host` binds `0.0.0.0`, required by browser suites)    |
| `npm run build`                   | Type-check + production build                                          |
| `npm run lint` / `npm run format` | ESLint (Prettier is enforced as errors) / auto-fix                     |
| `npm test`                        | Unit tests (jsdom). `test:watch` reruns `#unit`/`#sanity`-tagged tests |
| `npm run test:coverage`           | Coverage gate: `src/core/**` ≥95% (currently 100%)                     |
| `npm run test:bdd`                | Acceptance (jest-cucumber) against `dev:host`                          |
| `npm run test:integration`        | Playwright integration against `dev:host`                              |
| `npm run test:visual`             | Visual goldens (4 projects: phone/desktop × light/dark)                |

All four suites must pass before a PR is ready; a pre-commit hook enforces lint +
Prettier, CI runs the rest.

## Conventions that will bite you otherwise

- `data-testid` attributes are a contract with the browser suites — see
  [`docs/testid-map.md`](docs/testid-map.md) and update all consumers in one commit.
- Colors, radii and animation come from the tokens in `src/index.css`
  ([`docs/design-tokens.md`](docs/design-tokens.md)); no hardcoded hex/new keyframes
  in components.
- Visual goldens are the desired state by definition. An intentional visual change
  means `npm run test:visual:update` **and** showing the golden diff in the PR.
- DB schema changes go through new **decorator versions** on the entity classes —
  never edit an existing version (see `AGENTS.md`).
- Portuguese copy changes break acceptance tests deliberately — update those
  assertions in the same commit.

## Pull request flow

1. Fork, branch off `main` (`feat/...`, `fix/...`).
2. Keep commits small and imperative ("Add undo to quick-add").
3. Green local run: `npm run lint && npm run build && npm run test:coverage && npm run test:bdd && npm run test:integration && npm run test:visual`.
4. Update `CHANGELOG.md` under `[Unreleased]` for anything user-visible.
5. Open the PR — describe the user-visible outcome, not just the code.

## Cutting a release

Maintainers only: update `CHANGELOG.md` (move `[Unreleased]` into a dated version,
add the compare links), ensure a clean tree, then
`npm run version:patch|minor|major` — it gates on lint+build+tests, bumps the version,
commits and tags. Publish the tag afterwards: `git push --follow-tags`.

## Getting help

Open an issue — questions, feature requests and rough ideas are all welcome. For
security issues, please use GitHub's private vulnerability reporting instead of a
public issue.
