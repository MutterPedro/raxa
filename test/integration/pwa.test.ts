import { test, expect, type Page } from '@playwright/test';

/**
 * PWA shell contract. Asserts the static install/safe-area metadata that both the dev
 * server and the production build serve from index.html, plus a safe-area inset harness
 * (via CDP, chromium-only — Firefox has no safe-area insets to simulate anyway)
 * proving the UI keeps clear of the notch/home-bar regions and never overflows horizontally,
 * plus a touch-target contract for the tiny chip remove buttons (chromium touch emulation).
 */

const APP_URL = 'http://127.0.0.1:5173/';

async function metaContent(page: Page, name: string): Promise<string | null> {
  return page.evaluate((metaName) => {
    const el = document.querySelector(`head meta[name="${metaName}"]`);
    return el ? el.getAttribute('content') : null;
  }, name);
}

test.describe('PWA shell #integration', function () {
  test.beforeEach(async function ({ page }) {
    await page.goto(APP_URL);
    await expect(page.getByTestId('app-header')).toBeVisible();
  });

  test('viewport opts into edge-to-edge rendering for safe-area support', async function ({ page }) {
    const viewport = await metaContent(page, 'viewport');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('viewport-fit=cover');
  });

  test('declares standalone display and iOS home-screen mode', async function ({ page }) {
    expect(await metaContent(page, 'mobile-web-app-capable')).toBe('yes');
    expect(await metaContent(page, 'apple-mobile-web-app-capable')).toBe('yes');
    expect(await metaContent(page, 'apple-mobile-web-app-status-bar-style')).toBe('black-translucent');
  });

  test('themes the system UI bar with the header brand color', async function ({ page }) {
    // The manifest (build-only) carries its own theme_color; this meta covers browser UI + iOS.
    // The header is brand-700 in both themes (AA for its text), so one static meta suffices.
    expect(await metaContent(page, 'theme-color')).toBe('#C2410C');

    await page.getByRole('button', { name: 'Alternar tema' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(await metaContent(page, 'theme-color')).toBe('#C2410C');
  });

  test('keeps content inside safe-area insets and free of horizontal overflow @chromium', async function ({
    page,
    browserName,
  }) {
    test.skip(browserName !== 'chromium', 'safe-area insets are simulated via CDP (chromium only)');

    const cdp = await page.context().newCDPSession(page);
    const viewport = page.viewportSize() ?? { width: 390, height: 844 };

    // The FAB (bottom inset probe) only renders for the signed-in shell, so seed the
    // dev-only demo session (same helper the visual goldens use) before re-entering.
    await page.evaluate(() => window.__seedVisualDemo?.());

    await cdp.send('Emulation.setSafeAreaInsetsOverride', {
      insets: { top: 48, bottom: 48, left: 0, right: 0 },
    });
    await page.goto(APP_URL);
    await expect(page.getByTestId('app-header')).toBeVisible();
    await expect(page.getByTestId('new-bill-float-button')).toBeVisible();

    // Chromium reports the emulated insets through env(); prove the harness itself works,
    // and that the app resolves its safe-area paddings from those insets (nav recomputes live).
    const measurements = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.cssText =
        'position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
      document.body.appendChild(probe);
      // Read every computed value BEFORE detaching the probe: getComputedStyle on a
      // removed element returns an empty style in Chromium.
      const { paddingTop: insetTop, paddingBottom: insetBottom } = getComputedStyle(probe);
      const nav = document.querySelector('[data-testid="app-bar"]');
      const logo = document.querySelector<HTMLElement>('nav a[aria-label="raxa"]');
      const navPad = nav ? getComputedStyle(nav).paddingTop : 'missing';
      const logoTop = logo ? logo.getBoundingClientRect().y : -1;
      probe.remove();
      return { insetTop, insetBottom, navPad, logoTop };
    });
    expect(measurements.insetTop).toBe('48px');
    expect(measurements.insetBottom).toBe('48px');
    expect(measurements.navPad).toBe('72px');

    // No horizontal scrollbars anywhere under the insets.
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

    // Header content (logo/links) sits below the top inset (status bar / notch).
    expect(measurements.logoTop).toBeGreaterThanOrEqual(48);

    // The floating action button sits above the bottom inset (home bar).
    const fabBox = await page.getByTestId('new-bill-float-button').boundingBox();
    expect(fabBox).not.toBeNull();
    expect(fabBox!.y + fabBox!.height).toBeLessThanOrEqual(viewport.height - 48);

    await cdp.detach();
  });

  test('chip remove buttons carry a ~44px touch hit area on phones @chromium', async function ({
    browser,
    browserName,
  }) {
    test.skip(browserName !== 'chromium', 'relies on chromium touch emulation semantics');

    // react-select's chip × is ~22×26px visually; on pointer:coarse devices the
    // theme grows its clickable area with an invisible pseudo-element (index.css).
    // The check is behavioral: a tap just outside the visual button must remove the chip.
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto(APP_URL);
    await expect(page.getByTestId('app-header')).toBeVisible();

    await page.evaluate(() => window.__seedVisualDemo?.());
    await page.goto(`${APP_URL}bill/1`);
    await page.getByTestId('edit-expense-1-button').click();
    const remove = page.getByRole('button', { name: 'Remove Ana' });
    await expect(remove).toBeVisible();

    const box = await remove.boundingBox();
    expect(box).not.toBeNull();
    // Sanity: the visual button is still the compact one (if it grows for real, drop this).
    expect(box!.height).toBeLessThan(30);

    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y - 8);
    await expect(page.getByRole('button', { name: 'Remove Ana' })).toHaveCount(0);

    await context.close();
  });
});
