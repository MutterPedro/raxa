# Raxa — UI/UX Refresh: Implementation Plan

> Status: awaiting approval · Planner: Qwen3.8 Flash-Next 125B (smart) · Execution: sub-agents per task card
> Non-negotiables: **A-TDD (tests first, red→green, 2 cycles)** · tests follow current patterns · every test diff
> reviewed against the Test Quality Checklist · PT-BR strings stay PT · `data-testid`s are contracts, changed only
> in a red commit.

## 1. Decisions locked (from Q&A)

| Area       | Decision                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope      | All screens: login, header/nav, bills list, bill detail, new bill, new expense                                                               |
| Look       | Modern minimal base + young & bold personality; fresh palette (2–3 options → pick on live styleguide)                                        |
| Branding   | New logo + wordmark (SVG), favicon + PWA icon set                                                                                            |
| Typography | One bold variable sans, self-hosted (drop Arvo + Google Fonts link)                                                                          |
| Dark mode  | Ship: token-driven, class strategy, system default + toggle                                                                                  |
| Layout     | Mobile-first single column; desktop = centered max-width column                                                                              |
| Flow       | Full quick-add: inline add-expense on bill detail; new bill + first expense in one screen                                                    |
| Feedback   | Empty states, skeletons, toasts w/ undo, inline validation, confirmations                                                                    |
| Offline UX | Reassurance cues + sync-readiness **messaging only** (no schema change; sync is login-gated and backend-less today)                          |
| PWA        | Full: manifest, icons, `theme-color`, safe areas, installable                                                                                |
| Copy       | Rewrite PT microcopy warm & concise (tests updated in same red commit)                                                                       |
| Deps       | Stay Tailwind-native (no component library). Allowed: font package, @vitejs/plugin-pwa or hand-rolled manifest, Playwright (already present) |
| Git        | Feature branch `ui-refresh`, sequential tasks, one commit per task                                                                           |
| QA         | Playwright golden screenshots (light+dark × phone+desktop); approved baselines committed — no vision-model rerun per task                    |

### Decisions (resolved at approval, 2026-11-10)

- **D1 — LoginForm wiring: NO.** Auth is a separate feature; the form stays functionally fake (no submit wiring)
  on this branch — restyle, copy and purely-client-side validation UI only.
- **D2 — pt-BR number/date formatting: YES.** `R$ 1.234,56`, `dd/mm/aaaa` via `Intl`, landed as one deliberate
  red-commit batch (T3.4) updating every affected assertion.
- **D3 — Undo primitives: YES.** `BillService.deleteExpense`/`deleteBill` land unit-first in T3.2; 95% core
  coverage gate stays green.
- **D4 — Palette: A · Tangerina** (user pick, T1.1, 2026-11-11). Workhorse `#C2410C`, glow `#EA580C`/`#F97316`,
  warm cream `#FAF6F0` / near-black-brown `#16120E`; AA-checked pairs recorded in `design/styleguide.html`.
- **D5 — Personality over patterns (user directive).** Avoid the "generated default" look. Standing rules for
  every styling task: no gradients on hero surfaces, no glassmorphism, no uniform `rounded-999` everywhere (keep a
  radius rhythm, e.g. 12/16/20 with intent); **no emoji as UI icons** (the 🎸/🍖/🎉 in the styleguide are sheet
  placeholders — icons become one consistent 2px-stroke hand-drawn set, monochrome + primary accent; emoji may only
  return as _user-chosen bill stickers_, a product decision for T2.x); personality lives in **typographic contrast**
  (large tight-tracked 800 numbers, tabular figures for currency), **one accent moment per screen** (tangerine must
  hit, not flood), specific warm PT-BR copy (no "Ops! algo deu errado" filler), and 1–2 signature details (e.g.
  underline badges, ticket-stub motifs) — not in decoration.

### Workflow (per user directive)

Step-by-step execution: each task ends with a handoff (evidence + diff summary); **the user approves and commits**
before the next task starts. The planner stages/commits nothing unless explicitly asked.

## 2. Model routing

| Role                    | Model                      | Variant | Does                                                                                                                       |
| ----------------------- | -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| Planner / Reviewer (me) | `llama/qwen3.8-flash-next` | high    | This plan, every test+diff review, palette/logo/typography design content, BDD scenario authoring for new flows, approvals |
| Executor — mechanical   | `llama/qwen3.6-35b-a3b`    | high    | Screen restyles, testid renames w/ step updates, copy passes, tokens application, PWA files                                |
| Executor — logic        | `llama/gpt-oss-120b`       | medium  | Quick-add flow, undo/delete in core services, theme system, toasts infra, harness                                          |
| Visual QA               | `llama/gemma-4-26b-a4b`    | —       | **Once only** in T5.1: reviews new screenshots vs intent before baselines are frozen                                       |

Rules: no executor touches `src/core/**` unless its card says so. Every task returns the **red run output**, the
green run output, and a diff summary. **Executor reports are claims, not evidence**: the planner re-runs every gate
independently before handoff, and treats report-vs-rerun mismatches as fabrication (task rejected — happened in
T0.2). I review every diff; **the user approves and commits**. One task at a time (sequential branch, commit-gate
between tasks).

## 3. A-TDD execution protocol (every task)

1. **Red** — author/update the tests first (acceptance scenarios and/or unit tests per the card), run them,
   capture failure. Style/behavior claims not expressible as assertions go to the visual goldens, never to DOM
   assertions.
2. **Green — short cycle** (seconds): `npx jest <touched unit tests>` (all unit tests tagged `#unit`), plus targeted
   `npx jest --testMatch **/*.steps.ts -t '<scenario>'` when acceptance tests were written.
3. **Green — long cycle** (minutes): `npm run lint && npm run build && npm test`, then `npm run test:bdd` (full —
   all 4 features must stay green) and `npm run test:integration` once at the end of the session/task group
   (they exercise infra the task barely touches; per-task full run only for infra-adjacent cards), plus
   `npm run test:visual` from Phase 2 onward (informational until T5.1 freezes baselines).
4. **Review** — I review the diff and the test diff against the Test Quality Checklist (below). Failures return to
   the same sub-agent with notes (max 2 fix rounds, then I take over).
5. **Handoff** — present red→green evidence + diff summary; **user approves and commits** (suggested message:
   `ui-refresh(T.x.y): <summary>`). Next task starts only after that commit.

## 4. Test Quality Checklist (review gate for every test diff)

- **Behavior, not implementation**: assert visible text, amounts, navigation, enabled/disabled, roles, presence of
  states. Never assert CSS classes, DOM nesting, or component structure — pixels are goldens' job.
- **No redundancy**: one BDD scenario per user-visible rule; unit tests only for logic BDD can't reach (pure
  functions, edge cases, error branches); never re-test a library. A unit test that duplicates a green BDD
  scenario's happy path is rejected.
- **Current patterns respected**: English Gherkin features + 1:1 `loadFeature` step files; Playwright integration
  via `window.*` helpers from `init()` + `#integration`; Jest unit with fakes from `test/core/fakes/`; `#unit`
  tags; `test/visual` must be added to jest `modulePathIgnorePatterns` (T0.2).
- **Stable selectors**: testids keyed by **entity ids**, never names (`bill-part-participant-${name}` is banned);
  prefer testids over CSS `#id` selectors (`#payer`, `#new-expense-form-participant-input` migrate when their
  screen is touched); new testids follow `<screen>-<element>[-<id>]` and get added to the testid map in docs.
- **Meaningful assertions**: exact amounts/text over `toBeVisible()` alone; no sleeps — use locator waits; the
  literal `'Criar'`, `'Adicionar'`, `'Eu'` only change in a red commit that updates all step files at once.
- **Coverage gate**: `src/core/**` stays ≥95% (branches/functions/lines/statements).

T0.3 applies this checklist to the **existing** suite as a behavior-preserving green refactor before any markup
changes, so the starting suite is trustworthy.

## 5. Visual goldens (the "desired state" store)

- New `playwright.visual.config.ts` + `test/visual/*.visual.test.ts`: screens = home-empty, home-list, bill-detail
  (expense + division visible), new-bill form, login signup/login tabs, toast shown; viewports = 390×844 and
  1280×720; `colorScheme` light and dark each. `toHaveScreenshot()` baselines committed under
  `test/visual/__screenshots__/`.
- Determinism: seed data via a tiny `window.__seedVisualDemo()` test helper (reuses `init()` patterns),
  `animations: 'disabled'`, `reducedMotion: 'reduce'`, fonts awaited, fixed fake timers via date injection.
- `npm run test:visual` compares (CI-failable); `npm run test:visual:update` re-approves — allowed **only** in T5.1
  or when a card explicitly updates the desired state (diff review includes the screenshot delta via gemma on
  request).

## 6. Phases & task cards

### Phase 0 — Foundations (no user-visible change)

| ID      | Task                                                                                                                                                                                                                                                                     | Executor           | Red artifact                                                                                  | Notes                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| T0.1 ✅ | `ui-refresh` branch created ✅; this plan + `docs/ui-refresh-brief.md` (standing sub-agent brief) — commit by user per workflow                                                                                                                                          | me                 | —                                                                                             | Brief is pasted into every sub-agent prompt          |
| T0.2    | Visual golden harness (§5) + scripts + jest ignore entry                                                                                                                                                                                                                 | gpt-oss-120b       | harness fails before config exists (trivially true); must pass redact: unit suite stays green | Runs headless chromium only; needs `.env` (dev:host) |
| T0.3    | **Test health refactor** of existing suites per Checklist (behavior-preserving, all green): kill redundancy, `#id` CSS selectors → testids where trivial, document flaky-risk points; `hidden sm:flex` amount bug explicitly marked (fixed in T2.4, not hidden by tests) | qwen3.6 + I review | N/A (refactor) — gate: all suites green before **and** after                                  | Gives us a trustworthy RED baseline                  |

### Phase 1 — Design system

| ID      | Task                                                                                                                                                                                                                                                                                                                                                                                                                                        | Executor                                 | Red artifact                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| T1.1 ✅ | **Palette proposals**: `design/styleguide.html` — standalone live page, 3 fresh palettes × (light+dark) × components. Delivered; **user picked A · Tangerina** (→ D4)                                                                                                                                                                                                                                                                       | me                                       | —                                                                                     |
| T1.2    | Brand: **(a) logo exploration** — `design/logo.html` with 4–6 real design directions (concepts around _raxa_/espetinho/compartilhar/dividir); user picks. **(b) production assets** — chosen logo + wordmark SVGs, favicon set, PWA icon set; typography decision (proposed: one bold variable sans, e.g. Plus Jakarta Sans, self-hosted in `public/fonts`); remove Arvo + Google Fonts link                                                | me (design) + qwen3.6 (files)            | build passes; font/asset smoke in harness shots                                       |
| T1.3    | Tokens + dark mode infra: Tailwind v4 CSS-first `@theme` (brand/surface/text/border/semantic scales, radii, shadows, type scale, motion tokens); `@custom-variant dark`; `useTheme` store (system default, localStorage, toggle) — **unit tests first** (theme store logic, `#unit`); removes dead `animate-fadeIn`, `text-secondary-primary`, `hover:green-900`, `focus:shadow-outline`, `border-2px`, hardcoded `#005b61` in LoadingGauge | gpt-oss-120b                             | unit: theme store set/toggle/persist/preference                                       |
| T1.4    | Common components (Tailwind-native): Button, Input/Field, Card, Sheet/Modal, Toast (`useToast`, a11y: `role="status"`, focus mgmt), Skeleton, EmptyState, Avatar + LoadingGauge redesign                                                                                                                                                                                                                                                    | qwen3.6 (inputs) / gpt-oss (toast+modal) | unit: toast queue & modal focus return; visual goldens updated as desired-state later |

### Phase 2 — Screen redesigns (each: red acceptance/unit → short cycle → long cycle → review → commit)

| ID   | Task                                                                                                                                                                                                                                                                                                                                                        | Executor        | Red artifact                                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| T2.1 | Header/NavBar: new wordmark, **mobile nav works** (today login button is `hidden lg:flex` — unreachable on phone), theme toggle in header. BDD: scenario "open login from mobile header" (viewport added to that step)                                                                                                                                      | qwen3.6         | BDD scenario + unit for toggle wiring                                                                                                     |
| T2.2 | Login/Signup screen: restyle, PT-BR copy, **stays fake (D1)**: no auth wiring — submit behavior exactly as today. Restyle + copy + "funciona offline — faça login para sincronizar" cue                                                                                                                                                                     | qwen3.6-35b-a3b | no new behavior to assert — gate: all suites green + golden review at T5.1                                                                |
| T2.3 | Bills list + BillItem: mobile-first full-width cards (drop `w-1/2`/`w-1/3`), skeleton while loading, empty state, warmer copy; testids stable (`bill-item-name-*`, `bill-total-*` preserved)                                                                                                                                                                | qwen3.6         | BDD: ListExistentBills keeps passing on new markup (adjust in red commit only if copy changes); skeleton asserted via state, not spinners |
| T2.4 | Bill detail: scannable redesign — balances card **always shows amounts on mobile** (fixes `hidden sm:flex`), payer highlight kept, real accordion animation, expense rows fixed (unstyled `text-secondary-primary` link), division list readable at 390px; testids `bill-total-span`, `bill-part-*-${id}` (keyed by user **id** — red commit updates steps) | qwen3.6         | BDD: BillDivision assertions on new testids + amounts visible at mobile viewport (harness viewport in step)                               |
| T2.5 | New bill = bill + first expense in one screen (quick-capture); misnamed testid `new-expense-form` (on the bill form) renamed in red commit w/ step update; float/jumbo buttons restyled, keep ids                                                                                                                                                           | gpt-oss-120b    | BDD: CreateBill updated — "creates bill with first expense in one submit"; unit: form orchestration                                       |

### Phase 3 — Flows & feedback

| ID   | Task                                                                                                                                                                                                                                                                | Executor     | Red artifact                                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T3.1 | Inline quick-add expense on bill detail (amount-first, defaults: split among participants, payer = Eu, today; optional fields behind "more") — needs `BillService.quickAddExpense(billId, {amount, ...})` with participant/payer/date defaulting in the **service** | gpt-oss-120b | **unit first**: `quickAddExpense` defaults & edge cases (no participants yet, payer not in list) → then BDD scenario "quick add expense by amount only" |
| T3.2 | Undo + confirmations: `deleteExpense` (pending D3) — **unit first**; undo toast on add-expense, confirm dialog on delete-bill; error toasts with retry on service failure                                                                                           | gpt-oss-120b | unit: delete + undo re-add semantics; BDD: undo scenario                                                                                                |
| T3.3 | Offline/sync cues: `useOnlineStatus` (`navigator.onLine` + events — unit tested), "Guardado no seu aparelho" chip after writes, offline banner, login-gated sync hint ("Faça login para sincronizar")                                                               | qwen3.6      | unit: hook state machine w/ fakes; BDD: hint presence when logged out                                                                                   |
| T3.4 | Microcopy pass across screens (warm PT-BR) + **D2** pt-BR currency/date formatting (`R$ 1.234,56`, `dd/mm`) — one red commit batch updating every affected step assertion at once                                                                                   | qwen3.6      | red: updated assertions first; then impl                                                                                                                |

### Phase 4 — PWA, a11y, motion

| ID   | Task                                                                                                                                                                                                         | Executor | Red artifact                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------- |
| T4.1 | PWA: manifest, themed `theme-color` (light/dark), icons from T1.2, safe-area padding, iOS meta, installable; offline shell still renders                                                                     | qwen3.6  | harness: no overflow under safe-area inset viewport                               |
| T4.2 | A11y pass: focus-visible ring tokens, tap targets ≥44px, AA contrast both themes (checked on T1.1 palette), aria on accordion/dialog/toast, keyboard order; axe-core smoke in visual project (warnings only) | qwen3.6  | axe smoke test (red on serious violations)                                        |
| T4.3 | Motion polish: tokenized transitions (press feedback, sheet/toast in-out), all honor `prefers-reduced-motion`                                                                                                | qwen3.6  | goldens with animations disabled (harness already) + unit for reduced-motion hook |

### Phase 5 — Freeze & hardening

| ID   | Task                                                                                                                                                                                    | Executor         | Gate                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------ |
| T5.1 | **Freeze goldens**: `test:visual:update` → gemma reviews every screenshot vs intent (contrast, hierarchy, mobile completeness) → you approve → baselines committed as the desired state | me + gemma + you | approved PNGs committed  |
| T5.2 | Full hardening: all suites green (`test`, `test:bdd`, `test:integration`, `test:visual`, lint, build, coverage ≥95%)                                                                    | qwen3.6          | CI-equivalent run        |
| T5.3 | Docs: update `AGENTS.md` (new scripts/test dir gotchas), testid map, theme/token notes, delete dead code; final whole-branch review diff                                                | me               | merge-ready `ui-refresh` |

## 7. Risks & mitigations

- **BDD copy coupling** (`'Criar'`, `'Adicionar'`, `'Eu'`, `Total R$ x.xx`): changed only in red commits; T3.4
  batches the format change deliberately.
- **Visual flakiness** (fonts/animations): disabled animations + reduced motion + font-stable harness; baselines
  only re-approved via update script + review.
- **Scope creep into core**: only T3.1/T3.2 touch `src/core/**`, both unit-first, coverage gate enforced per task.
- **Sub-agent drift from house style**: standing brief (T0.1) + Checklist gate + 2-fix-round limit then takeover.
- **LoginForm stays fake (D1)**: no auth wiring on this branch; if any flow or sub-agent proposes wiring it, refuse —
  real auth is a separate feature (session infra already covered by `test/integration/FirebaseSessionManager.test.ts`).

## 8. Definition of done

`ui-refresh` branch where: every screen redesigned in the chosen bold/minimal system, dark mode shipped, quick-add
flow live, feedback states everywhere, PWA installable, goldens frozen as committed "desired state", all four
suites green per A-TDD protocol at every commit, and no test asserts an implementation detail.
