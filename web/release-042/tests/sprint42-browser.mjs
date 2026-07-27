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

  await page.locator('.s42-menu-button').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.s42-menu-button').count(), 1);

  const galiaFrame = page.frames().find((candidate) => candidate.url().includes('sprint35.html'));
  assert.ok(galiaFrame, '0.42 must load the Galia runtime');
  await galiaFrame.locator('body[data-s42-menu-managed="true"]').waitFor();
  await galiaFrame.locator('#commandToggle').waitFor({ state: 'hidden' });
  await galiaFrame.locator('#sagStoryToggle').waitFor({ state: 'hidden' });
  await galiaFrame.locator('#galiaToggle').waitFor({ state: 'hidden' });

  await page.locator('.s42-menu-button').click();
  await page.locator('.s42-drawer.open').waitFor();
  await page.locator('[data-open="galia"]').click();
  await galiaFrame.locator('#galiaShell:not(.g-hidden)').waitFor();
  await galiaFrame.locator('#galiaClose').waitFor({ state: 'visible' });
  await galiaFrame.locator('#galiaClose').click({ force: true });
  await galiaFrame.locator('#galiaShell.g-hidden').waitFor();

  await page.locator('.s42-menu-button').click();
  await page.locator('[data-open="command"]').click();
  await galiaFrame.locator('#commandCenter:not(.hidden)').waitFor();
  await galiaFrame.locator('#commandClose').waitFor({ state: 'visible' });
  await galiaFrame.locator('#commandClose').click({ force: true });
  await galiaFrame.locator('#commandCenter.hidden').waitFor();

  await page.locator('.s42-menu-button').click();
  await page.locator('[data-open="sag"]').click();
  await galiaFrame.locator('#sagStoryShell:not(.sag-hidden)').waitFor();
  await galiaFrame.locator('#sagStoryClose').waitFor({ state: 'visible' });
  await galiaFrame.locator('#sagStoryClose').click({ force: true });
  await galiaFrame.locator('#sagStoryShell.sag-hidden').waitFor();

  console.log('Sprint 42 unified-menu browser regression passed');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
