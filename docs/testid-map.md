# Test ID map

Every `data-testid` in `src/components/`, which component owns it, and which suites
depend on it. Acceptance (`test/acceptance/`), Integration (`test/integration/`,
Playwright), Visual (`test/visual/`), Unit (`test/components/`).
**Renaming one breaks every suite listed — update them all in the same commit.**

## Static ids

| testid                                                                                                                  | component                        | suites                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| `app-header`                                                                                                            | `header/Header.tsx`              | integration                                                                   |
| `app-bar`                                                                                                               | `header/NavBar.tsx`              | integration                                                                   |
| `theme-toggle-sun` / `theme-toggle-moon`                                                                                | `header/ThemeToggle.tsx`         | unit (toggle itself is also reached by role `Alternar tema` in browser tests) |
| `header-login-link`                                                                                                     | `login/LoginButton.tsx`          | acceptance, integration, unit                                                 |
| `sync-hint`                                                                                                             | `login/SyncHint.tsx`             | acceptance, integration, unit                                                 |
| `login-submit-button` / `login-error`                                                                                   | `login/LoginForm.tsx`            | unit                                                                          |
| `offline-banner`                                                                                                        | `common/OfflineBanner.tsx`       | visual                                                                        |
| `avatar-picture`                                                                                                        | `common/Avatar.tsx`              | unit                                                                          |
| `saved-chip`                                                                                                            | `common/SavedChip.tsx`           | unit, visual                                                                  |
| `bills-list-skeleton`                                                                                                   | `expense/BillsList.tsx`          | unit                                                                          |
| `bills-list-sentinel`                                                                                                   | `expense/BillsList.tsx`          | acceptance, unit                                                              |
| `expenses-sentinel`                                                                                                     | `expense/BillDetail.tsx`         | unit                                                                          |
| `bills-search-input`                                                                                                    | `MainContainer.tsx`              | acceptance, unit, visual                                                      |
| `new-bill-jumbo-button`                                                                                                 | `expense/NewBillJumboButton.tsx` | acceptance, unit, visual                                                      |
| `new-bill-float-button`                                                                                                 | `expense/NewBillFloatButton.tsx` | acceptance, integration                                                       |
| `new-bill-form`, `new-bill-form-name-input`, `new-bill-form-amount-input`                                               | `expense/NewBillForm.tsx`        | acceptance, unit, visual                                                      |
| `bill-total-span`                                                                                                       | `expense/BillDetail.tsx`         | acceptance, unit, visual                                                      |
| `new-expense-button`                                                                                                    | `expense/BillDetail.tsx`         | acceptance, visual                                                            |
| `delete-bill-button`, `delete-bill-confirm`                                                                             | `expense/BillDetail.tsx`         | acceptance (button), visual (both)                                            |
| `new-expense-form`, `new-expense-form-amount-input`, `new-expense-more-toggle`                                          | `expense/NewExpenseForm.tsx`     | acceptance, unit (toggle also in visual flow)                                 |
| `edit-bill-button`, `edit-bill-form`, `edit-bill-form-name-input`, `edit-bill-form-date-input`, `edit-bill-form-submit` | `expense/BillDetail.tsx`         | acceptance, unit, visual (form)                                               |
| `edit-expense-form`, `edit-expense-form-amount-input`, `edit-expense-form-submit`                                       | `expense/EditExpenseForm.tsx`    | acceptance, unit, visual (form)                                               |
| `edit-expense-{id}-button`                                                                                              | `expense/ExpenseItem.tsx`        | acceptance, unit                                                              |

## Dynamic ids (template)

| pattern                              | component                              | notes                                                                      |
| ------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------- |
| `bill-item-name-${bill.id}`          | `expense/BillItem.tsx`                 | bill row title on the home list                                            |
| `bill-total-${bill.id}`              | `expense/BillItem.tsx`                 | bill row total; assertions format money via `test/acceptance/steps/brl.ts` |
| `bill-part-participant-${user.name}` | `expense/BillParticipantsPartList.tsx` | keyed by display name, not id                                              |
| `bill-part-amount-${user.name}`      | `expense/BillParticipantsPartList.tsx` | same keying                                                                |

## Non-testid selectors browser tests rely on

- Toast rows are located by message text, then `.parentElement` for the animated row
  (`toast-modal` idiom); close button by label `Fechar`.
- Modal by `role="dialog"` (exiting panel only via `{ hidden: true }` — it is
  `aria-hidden` during its exit animation).
- Theme toggle by accessible name `Alternar tema`; segmented login control by
  `aria-pressed`.
- Integration tests call helpers exposed on `window` by `init()`
  (`createTable`, `doesDbExists`, `getFirebaseSessionManager`, `__seedVisualDemo`,
  `__notifyToast`) — renaming those breaks `test/integration/` and `test/visual/`.
