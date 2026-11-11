# Visual Golden Tests

Deterministic screenshots of every screen state, in light+dark at phone (390×844) and desktop (1280×720)
viewports. Committed PNGs under `__screenshots__/<project>/` are the **desired state**: changing them means
changing what the UI should look like, so they are only regenerated deliberately and reviewed like code.

## Running the suite

```bash
npm run test:visual
```

Starts `dev:host` itself (reuses a running one locally) and diffs each screen against its baseline.

## Updating baselines

Only run this when a task card explicitly changes the desired visual state:

```bash
npm run test:visual:update
```

The resulting PNG diff must be reviewed (and approved) together with the code change — never blind-accept it.

## Determinism rules

- Fixed clock (`page.clock.setFixedTime`, 2026-01-15T12:00:00) — installed before first navigation.
- `animations: 'disabled'` and `reducedMotion: 'reduce'` in the config.
- Fixed demo data via the DEV-only `window.__seedVisualDemo()` (self + Ana + Beto, two bills, two expenses);
  screens that need the empty state must not seed (`gotoFresh`) — seeded routes reload so data renders.
- Date inputs are filled with the fixed date before capture (today-defaults would drift daily).
- Screenshots wait on `document.fonts.ready` plus content anchors — never on sleeps.
