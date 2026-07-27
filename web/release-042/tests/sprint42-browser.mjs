import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const releaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const menuScript = await readFile(path.join(releaseRoot, 'sprint42-menu.js'), 'utf8');
const menuStyles = await readFile(path.join(releaseRoot, 'sprint42-menu.css'), 'utf8');
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.setContent(`<!doctype html><html><head><style>${menuStyles}</style></head><body><iframe id="baseBuild"></iframe><script>${menuScript}<\/script></body></html>`);

  const menuButton = page.locator('.s42-menu-button');
  await menuButton.waitFor({ state: 'visible' });
  assert.equal(await menuButton.count(), 1, 'exactly one central menu trigger must be visible');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');

  await menuButton.click();
  const drawer = page.locator('.s42-drawer.open');
  await drawer.waitFor({ state: 'visible' });
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('.s42-close').isVisible(), true, 'central menu requires a visible X close button');
  assert.equal(await page.locator('[data-open="command"]').count(), 1);
  assert.equal(await page.locator('[data-open="sag"]').count(), 1);
  assert.equal(await page.locator('[data-open="galia"]').count(), 1);

  await page.locator('.s42-close').click();
  await page.locator('.s42-drawer').waitFor({ state: 'hidden' });
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');

  console.log('Sprint 42 unified-menu browser regression passed');
} finally {
  await browser.close();
}
