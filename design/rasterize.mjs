// raxa — T1.2(b) rasterizes the master SVGs (design/src/, public/) into exact PNGs.
// Chromium renders the SVG as a document; the viewport defines the pixel-perfect size.
// Usage: npm run assets:png   (run from repo root; uses the repo's @playwright/test Chromium)
import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public');

// [source svg, output png, side px, transparent background?]
const TARGETS = [
  ['public/favicon.svg', 'public/favicon-16.png', 16, true],
  ['public/favicon.svg', 'public/favicon-32.png', 32, true],
  ['design/src/tile-512.svg', 'public/apple-touch-icon.png', 180, false],
  ['design/src/tile-512.svg', 'public/pwa-192.png', 192, false],
  ['design/src/tile-512.svg', 'public/pwa-512.png', 512, false],
  ['design/src/tile-512.svg', 'public/pwa-maskable-512.png', 512, false],
  ['design/src/splash-light.svg', 'public/splash-light.png', 1024, false],
  ['design/src/splash-dark.svg', 'public/splash-dark.png', 1024, false],
];

const sized = async (src, px) => {
  const svg = await readFile(path.join(ROOT, src), 'utf8');
  // zero margin and zero line-height: the SVG must start at pixel (0,0) exactly
  const sizedSvg = svg
    .replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1')
    .replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
    .replace('<svg ', `<svg width="${px}" height="${px}" style="display:block" `);
  return `<!doctype html><html><head><style>html,body{margin:0;padding:0;line-height:0}</style></head><body>${sizedSvg}</body></html>`;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
for (const [src, out, px, transparent] of TARGETS) {
  await page.setContent(await sized(src, px), { waitUntil: 'load' });
  const png = await page.screenshot({
    clip: { x: 0, y: 0, width: px, height: px },
    omitBackground: transparent,
  });
  await writeFile(path.join(ROOT, out), png);
  console.log(`${out}  ${px}x${px}  ${png.byteLength} bytes`);
}
await browser.close();
