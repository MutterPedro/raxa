# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Bill search and an infinite bills feed** — a search field above the home list narrows
  bills by name ignoring case and accents (typing is debounced; blank lists everything),
  and the list auto-loads older pages as its end scrolls into view — no buttons, no
  page-size knowledge in the UI (`countBills` drives "more pages"). The persistence port
  gained predicate paging (`searchPage`/`count`) for this.
- **Edit bills and expenses** — an `Editar` button on the bill card opens an inline form
  for name and date, and a pencil on each expense row opens a fully prefilled edit form
  (name, amount, date, participants, payer).

### Changed

- The home bills list is now ordered newest first, so a freshly created bill lands at the
  top instead of the bottom.
- The payer no longer has to be one of the expense participants. Paying on behalf of
  everyone is now explicit: the participants share the full amount and owe it back, and
  the outside payer shows up in "Quem fica com quanto" with the amount to receive
  (balances still sum to zero). Quick add no longer forces the payer into the split.
- Test-only helpers (`window.createTable`, `doesDbExists`, `getFirebaseSessionManager`,
  `__seedVisualDemo`, `__notifyToast`) are now exposed exclusively in dev builds and are
  stripped from production bundles.

### Fixed

- The "Quem fica com quanto" division shows skeleton rows while loading instead of an
  empty gap that pops into content.
- Touch devices: the × that removes a participant chip now has a ~44px hit area
  (previously ~22×26px, hard to hit with a finger; the chip keeps its compact look).

## [0.1.0] - 2026-11-15

First public release — a fully offline-capable expense-splitting PWA with a refreshed
design system.

### Added

- **Bills & expenses** — create bills with participants, quick-add expenses (amount-only
  with sensible defaults, `Mais opções` for the rest), per-participant division
  ("Quem fica com quanto"), undo for added expenses, delete-bill with confirmation
  modal and expense cascade.
- **Offline first** — all data lives in the browser (IndexedDB via Dexie); a
  non-intrusive offline banner and a "Guardado no seu aparelho" chip make the local
  promise visible. Firebase is used only for the (optional) session; sign-in is never
  required to use the app.
- **Installable PWA** — manifest, generated icon set, service worker, iOS splash
  screens and safe-area padding.
- **Design system** — Tangerina brand tokens, light/dark/system theme (FOUC-guarded),
  shared component kit (buttons, fields, cards, modal, toast), tokenized motion with
  full `prefers-reduced-motion` support.
- **Accessibility** — AA contrast in both themes, visible focus rings, ≥44 px tap
  targets, screen-reader-friendly dialogs/toasts, automated axe-core + tap-target
  audits in the visual suite.
- **Quality gates** — four test suites (Jest unit, jest-cucumber acceptance, Playwright
  integration, Playwright visual goldens), 100% coverage on the domain layer, a11y
  smoke, pre-commit lint.
- **pt-BR everywhere it counts** — user-facing strings in Brazilian Portuguese with
  native currency/date formatting (`R$ 1.234,56`, `15/01/2026`).

[unreleased]: https://github.com/MutterPedro/raxa/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/MutterPedro/raxa/releases/tag/v0.1.0
