import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const releaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyRoot = path.resolve(releaseRoot, '..', 'legacy-041');
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    let absolute = path.resolve(legacyRoot, relative);
    try {
      const details = await stat(absolute);
      if (!details.isFile()) throw new Error('Not a file');
    } catch {
      absolute = path.resolve(releaseRoot, relative);
    }
    const allowed = [legacyRoot, releaseRoot].some((root) => absolute === root || absolute.startsWith(`${root}${path.sep}`));
    if (!allowed) return response.writeHead(403).end();
    const details = await stat(absolute);
    if (!details.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'content-type': contentTypes.get(path.extname(absolute)) || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(absolute).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'networkidle' });

  const menuButton = page.locator('.s42-menu-button');
  await menuButton.waitFor({ state: 'visible' });
  assert.equal(await menuButton.count(), 1, 'exactly one central menu trigger must be visible');
  await menuButton.click();
  await page.locator('.s42-drawer.open').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.s42-close').isVisible(), true, 'central menu requires a visible X close button');
  assert.equal(await page.locator('[data-open="command"]').count(), 1);
  assert.equal(await page.locator('[data-open="sag"]').count(), 1);
  assert.equal(await page.locator('[data-open="galia"]').count(), 1);

  console.log('Sprint 42 unified-menu browser regression passed');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
