# Theme & design tokens

Source of truth: `src/index.css` (Tailwind v4 CSS-first — no `tailwind.config.js`).
Rendered spec sheet: `design/styleguide.html`. Brand assets source:
`design/logo-final.html` (never hand-edit `public/brand/` or favicons — run `npm run assets`).

## Theme mechanics

- `src/infra/theme.ts` — framework-free store (system default → `localStorage` key
  `raxa:theme`) + `src/components/common/useTheme.ts` (`useSyncExternalStore`).
- `.dark` class on `<html>`; Tailwind variant declared once:
  `@custom-variant dark (&:where(.dark, .dark *));`.
- Inline FOUC-guard script in `index.html` applies the stored theme before paint.
- PWA/browser-chrome color is one **static** `#C2410C` (brand-700) in both schemes —
  the header is brand-700 in both themes because brand-50 text on brand-600 fails AA.

## `@theme` tokens

- **brand** — Tangerina scale `50…950` (D4). Key stops: 500 primary actions,
  700 header + theme-color, 400 dark-mode ring/accent.
- **surface** — `surface` (page), `surface-raised` (cards, sheets, toasts),
  `surface-sunken` (inputs, tracks).
- **ink** — `ink` (text), `ink-muted` (secondary/captions — AA-safe), `ink-faint`
  (tertiary only, large-ish text).
- **line** — `line`, `line-strong` (outlined-button borders).
- **semantic** — `danger` (destructive), `success` + `success-strong` (AA text on
  success chip), `ring` = `--ring` (brand-600 light / brand-400 dark).
- `primary`/`secondary` — legacy aliases kept for the `.bg-primary` /
  `.text-secondary-color` compat classes; new code uses the scales.
- **radii** — `--radius-field` 12 (buttons/inputs), `--radius-card` 16,
  `--radius-sheet` 20 (modals).
- **shadow** — `--shadow-card` (both themes' elevation).
- **motion** — `--ease-soft`; named animations `fade-in` 0.2s, `fade-out` 0.15s,
  `sheet-in` 0.25s, `sheet-out` 0.2s. JS timers (`TOAST_EXIT_MS`, `SHEET_EXIT_MS`)
  are pinned to the CSS durations — change both sides together.

## Shared utilities (`@utility` in `src/index.css`)

- `focus-ring` — 2px `--ring` outline on `:focus-visible` (+2px offset); on every
  interactive control. react-select gets it via `:has(input:focus-visible)`.
- `press` — 0.12s `ease-soft` transition of transform/colors + `:active`
  translateY(1px); on Buttons, bill rows, FAB.

## Reduced motion

- CSS floor: one global `@media (prefers-reduced-motion: reduce)` rule collapses
  all animations/transitions to 0.01ms (`!important`).
- JS floor: `useReducedMotion` (matchMedia-based) gates exit animations;
  environments without `matchMedia` (jsdom, SSR) count as **reduced** — that is
  why unit tests see instant toast/modal removal.
- Visual harness runs with `reducedMotion: 'reduce'` + animations disabled, so
  goldens never capture mid-animation frames.
