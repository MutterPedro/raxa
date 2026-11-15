<div align="center">

# Raxa

**Split expenses, fairly — online or not.**

An offline-first expense-splitting PWA. Your data lives on your device, not on our
servers. No account needed, no ads, no tracking — **free forever, by design.**

[![license: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Node](https://img.shields.io/badge/node-%E2%89%A522.22.1-green.svg)](https://nodejs.org)

> The app interface is currently in Brazilian Portuguese 🇧🇷 — other languages are a
> welcome first contribution.

</div>

## Why Raxa exists

Splitting a group trip, a pizza night or a shared apartment usually means handing your
social & financial data to yet another company, and praying you have signal when the
bill arrives. Raxa takes the opposite bets:

- **Offline first, not offline "also".** The phone's database (IndexedDB) is the
  primary store — reads and writes never wait on a network. Airplane mode is just
  another Tuesday. A sync layer can be added later; the app never _needs_ it.
- **Free forever, and it stays that way.** Licensed under AGPL-3.0: no ads, no
  premium tier, and any fork that runs as a service must also give you its source.
  The four letters do the promising.
- **Your data never leaves the device** (unless you connect an account on purpose).
  Firebase is wired for the optional session only — logging out, or never signing in,
  changes nothing about the core experience.
- **Installable, instant, familiar.** A real PWA: manifest, icons, service worker,
  iOS splash screens, safe-area padding. Add it to your home screen and forget it's
  a website.
- **Splitting that feels human.** Quick-add an expense with just an amount and the
  division is ready; undo everything from a toast; see _who owes what_ at a glance.
  Warm microcopy in PT-BR, dark mode included.

## Features

- 💸 Bills with participants, expenses, and per-person division ("Quem fica com quanto")
- ⚡ Quick-add: an amount is enough — adjust only if you want to
- ↩️ Undo on every expense; delete-bill confirmation with full cascade
- 📴 Works fully offline, with calm offline/saved indicators
- 🧩 Installable PWA (works standalone, phone & desktop)
- 🌗 Light / dark / system theme, AA contrast, big tap targets, reduced-motion support
- 🇧🇷 Native pt-BR money & dates (`R$ 1.234,56`, `15/01/2026`)
- 🧪 Four test suites: unit, acceptance (Gherkin), integration and visual goldens

## Quick start

```bash
git clone https://github.com/MutterPedro/raxa.git
cd raxa
npm install
cp .env.example .env   # fill in a Firebase project (auth only; any project works)
npm run dev
```

Open http://localhost:5173 — create a bill, add expenses, watch the math. No account
required.

<details>
<summary>Environment variables</summary>

Raxa fails fast at startup if these are missing (see `src/infra/env.ts`):
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
`VITE_FIREBASE_APP_ID`.

</details>

## Run it like CI

```bash
npm run lint            # ESLint + Prettier gate
npm run build           # type-check + production build
npm run test:coverage   # unit tests, 95% coverage gate on src/core/**
npm run test:bdd        # acceptance scenarios (starts dev server)
npm run test:integration
npm run test:visual     # golden screenshots, 4 viewports/themes
```

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 (CSS-first tokens) · Dexie
(IndexedDB) · inversify DI · Jest + jest-cucumber + Playwright · Firebase (session
only).

Layout: `src/core/` framework-free domain, `src/infra/` adapters (Dexie, Firebase,
bootstrap), `src/components/` UI. `AGENTS.md` maps the whole repo — start there.

## Contributing

Contributions are what keep projects like this alive. Read
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the flow, then pick anything — a translation,
an a11y improvement, a test, a feature. Not sure where to start? Open an issue and
say hi 👋

## License

Raxa is free and open-source software licensed under the
[AGPL-3.0](LICENSE.md). The short version: use it, study it, change it, share it —
and if you run a changed version as a service, give that version to the world too.
