# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Infinite expense feed** — the bill detail screen no longer loads every expense at once:
  the list appends the next page as its end scrolls into view, exactly like the home bills
  feed (the sentinel logic now lives in a shared `useSentinel` hook; `getExpensesPage` and
  `countExpenses` drive it, keeping the familiar oldest-first order).
- **Working login** — the login screen is live: sign up (email + password + name, claiming
  the local self row), password login, and Google sign-in (`signInWithPopup`), all verified
  against Firebase Auth before any local row is touched. Auth failures surface in pt-BR
  (deliberately vague for wrong credentials), dismissed Google popups stay silent, and a
  pending request disables the buttons. Signing in makes the sync hint disappear and lands
  on the home list.
- **Bill search and an infinite bills feed** — a search field above the home list narrows
  bills by name ignoring case and accents (typing is debounced; blank lists everything),
  and the list auto-loads older pages as its end scrolls into view — no buttons, no
  page-size knowledge in the UI (`countBills` drives "more pages"). The persistence port
  gained predicate paging (`searchPage`/`count`) for this.
- **Expense search** — the same name search now lives inside the bill detail's expense
  feed: a field above the rows narrows them by name ignoring case and accents (debounced;
  blank lists everything), paging stays correct under the filter, and writes while
  filtering refetch instead of guessing where the row belongs (`getExpensesPage` and
  `countExpenses` gained the search option).
- **Edit bills and expenses** — an `Editar` button on the bill card opens an inline form
  for name and date, and a pencil on each expense row opens a fully prefilled edit form
  (name, amount, date, participants, payer).

### Changed

- Entities now carry sync status: `bill`, `expense` and `user` rows have a `synced_at`
  timestamp (schema v4) — absent means the row has local changes not yet sent to the
  server, and every write through a repository puts the row back to pending. Nothing
  stamps it until the sync worker lands; this is the groundwork.
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

- **The Google picture shows on the `Eu` row everywhere** — Google login used to create a
  second local row (e.g. `Pedro`) carrying the photo while every bill and expense still
  referenced the `Eu` self row, so its circles kept showing initials. The provider identity
  (email, uid, picture) now lands on the self row itself, keeping the friendly `Eu` name;
  devices that already hold the duplicate row fold it into the self one on the next login
  or restore, with its expense references (payer and participants) repointed.
- **Profile pictures** — Google accounts now carry their profile photo: the URL travels
  with the session credentials (a `photo_url` field on the user, schema v3), is persisted
  at login and refreshed on restore when the provider rotates it, and the avatar shows it
  — falling back to the initials when it can't load (offline).
- **Amount fields accept the decimal comma** — valor inputs are plain text fields with a
  decimal keypad (`inputMode="decimal"`) instead of `type="number"`, so a pt-BR mobile
  keyboard can actually type `10,5`. Parsing accepts what users type and paste: `10,5`,
  `1.234,56`, and dot decimals alike, and the edit-expense form prefills with a comma.
- **The session survives a full page reload** — Firebase persists its own sign-in, but a
  reload (or a Google login) used to leave the header on `Entrar` and the sync hint
  showing. Local user rows now store the Firebase uid, boot restores the matching row as
  the logged user before the first render (adopting an email match and re-binding its uid;
  an unknown account logs nobody in), and the header avatar and sync hint track the real
  logged user through a small logged-user subscription — so they also flip in place right
  after signing in, without waiting for a reload. Pinned by an integration regression test
  that signs up, checks the header, reloads, and checks again.
- Deep links (e.g. `/login` opened directly) 404'd on GitHub Pages — the build now ships
  the app shell as `404.html`, which Pages serves for unknown paths so the router takes over.
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
