import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoFresh, gotoSeeded } from './helpers';

/**
 * Accessibility smoke. axe-core runs with every WCAG 2.x A/AA tag on the key screen
 * states of both themes; findings with serious/critical impact fail the run, the rest
 * are surfaced as warnings (per the harness contract: red on serious violations only).
 * A companion audit measures real tap-target sizes (≥44px) on the phone projects.
 */

const MIN_TAP_TARGET = 44;

const screens: Record<string, (page: Page) => Promise<void>> = {
  'home-empty': (page) => gotoFresh(page),
  'home-list': (page) => gotoSeeded(page),
  'bill-detail': (page) => gotoSeeded(page, '/bill/1'),
  'new-bill-form': async (page) => {
    await gotoFresh(page);
    await page.getByTestId('new-bill-jumbo-button').click();
  },
  'new-expense-form': async (page) => {
    await gotoSeeded(page, '/bill/1');
    await page.getByTestId('new-expense-button').click();
    await page.getByRole('button', { name: 'Mais opções' }).click();
  },
  'delete-bill-confirm': async (page) => {
    await gotoSeeded(page, '/bill/1');
    await page.getByTestId('delete-bill-button').click();
  },
  'toast-undo': async (page) => {
    await gotoSeeded(page, '/bill/1');
    await page.getByTestId('new-expense-button').click();
    await page.getByTestId('new-expense-form-amount-input').fill('30');
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.getByRole('button', { name: 'Desfazer' })).toBeVisible();
  },
  'login-signup': async (page) => {
    await gotoSeeded(page, '/login');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByLabel('Confirmar senha')).toBeVisible();
  },
};

const formatViolations = (violations: { id: string; impact?: string; nodes: { target: string[] }[] }[]) =>
  violations
    .map((v) => `[${v.impact ?? 'unknown'}] ${v.id} :: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
    .join('\n');

async function expectNoSeriousAxeViolations(page: Page, screen: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const warnings = results.violations.filter((v) => v.impact !== 'serious' && v.impact !== 'critical');
  if (warnings.length > 0) console.warn(`axe ${screen} (non-blocking):\n${formatViolations(warnings)}`);
  expect(serious, `serious axe violations on ${screen}:\n${formatViolations(serious)}`).toEqual([]);
}

async function collectSmallTapTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    // The react-select search input is a 2px-wide cursor host; the real touch target is
    // its control wrapper, captured via the select__ classNamePrefix (added in SelectField).
    const selector = 'button, a[href], summary, select, input:not([role="combobox"]), .select__control';
    const small: string[] = [];
    for (const el of Array.from(document.querySelectorAll(selector))) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      if (el.matches('input, select, button') && (el as HTMLButtonElement).disabled) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      // Inline links woven into a sentence are sized by the text, not by touch rules.
      if (el.tagName === 'A' && el.closest('p')) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.width < min || rect.height < min) {
        const label = el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 30);
        small.push(`${el.tagName.toLowerCase()} "${label}" ${Math.round(rect.width)}x${Math.round(rect.height)}`);
      }
    }
    return small;
  }, MIN_TAP_TARGET);
}

test.describe('a11y smoke #a11y', function () {
  for (const [name, open] of Object.entries(screens)) {
    test(`axe: ${name}`, async function ({ page }, testInfo) {
      test.skip(
        !testInfo.project.name.startsWith('phone'),
        'aria/contrast findings do not depend on viewport; phone projects cover both themes',
      );
      await open(page);
      await expectNoSeriousAxeViolations(page, `${name} (${testInfo.project.name})`);
    });
  }
});

test.describe('tap targets ≥44px #a11y', function () {
  for (const [name, open] of Object.entries(screens)) {
    test(`44px: ${name}`, async function ({ page }, testInfo) {
      test.skip(!testInfo.project.name.startsWith('phone'), 'tap targets are a touch-input concern');
      await open(page);
      const small = await collectSmallTapTargets(page);
      expect(small, `controls under ${MIN_TAP_TARGET}px on ${name}`).toEqual([]);
    });
  }
});
