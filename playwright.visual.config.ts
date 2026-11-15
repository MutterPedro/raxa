import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/visual',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}-{platform}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    trace: 'off',
    animations: 'disabled',
    reducedMotion: 'reduce',
    // Cross-machine golden stability (dev box vs CI ubuntu runners): disable font
    // hinting (otherwise glyph raster/advance widths differ per fontconfig profile)
    // and pin sRGB so color management can't shift the palette. Goldens are
    // recorded with this exact flag set (test:visual:update).
    launchOptions: {
      args: ['--font-render-hinting=none', '--force-color-profile=srgb'],
    },
  },
  projects: [
    {
      name: 'phone-light',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true,
        colorScheme: 'light',
      },
    },
    {
      name: 'phone-dark',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true,
        colorScheme: 'dark',
      },
    },
    {
      name: 'desktop-light',
      use: {
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
      },
    },
    {
      name: 'desktop-dark',
      use: {
        viewport: { width: 1280, height: 720 },
        colorScheme: 'dark',
      },
    },
  ],
  webServer: {
    command: 'npm run dev:host',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
});
