import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const runtimeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseRoot = path.resolve(runtimeRoot, '..', 'release-042');
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
    let absolute = path.resolve(runtimeRoot, relative);
    try {
      const details = await stat(absolute);
      if (!details.isFile()) throw new Error('Not a file');
    } catch {
      absolute = path.resolve(releaseRoot, relative);
    }
    const allowed = [runtimeRoot, releaseRoot].some((root) => absolute === root || absolute.startsWith(`${root}${path.sep}`));
    if (!allowed) {
      response.writeHead(403).end();
      return;
    }
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
  assert.equal(await page.locator('.s42-menu-button').count(), 1, 'only one central menu trigger should remain visible');

  const galiaFrame = page.frames().find((frame) => frame.url().includes('sprint35.html'));
  assert.ok(galiaFrame, 'current 0.42 wrapper must load the Galia runtime');
  await galiaFrame.locator('#commandToggle').waitFor();
  assert.equal(await galiaFrame.locator('#commandToggle').isVisible(), false, 'legacy Command toggle must be hidden');
  assert.equal(await galiaFrame.locator('#sagStoryToggle').isVisible(), false, 'legacy SAG toggle must be hidden');
  assert.equal(await galiaFrame.locator('#galiaToggle').isVisible(), false, 'legacy Galia toggle must be hidden');

  const introHeartbeat = await galiaFrame.evaluate(async () => {
    const root = document.getElementById('sagIntro');
    if (!root) return { responsive: false, reason: 'missing intro root' };
    root.innerHTML = '<article class="sag-intro-scene"><div class="sag-intro-copy"></div></article>';
    await new Promise((resolve) => setTimeout(resolve, 250));
    return {
      responsive: true,
      scenes: root.querySelectorAll('.sag-intro-scene').length,
      title: root.querySelector('.sag-intro-copy h2')?.textContent || '',
    };
  });
  assert.deepEqual(introHeartbeat, {
    responsive: true,
    scenes: 1,
    title: 'DER FRIEDEN IST KEINE LEERE',
  }, 'intro observer must settle without freezing the browser');

  await page.locator('.s42-menu-button').click();
  await page.locator('.s42-drawer.open').waitFor();
  await page.locator('[data-open="galia"]').click();
  await galiaFrame.locator('#galiaShell:not(.g-hidden)').waitFor();
  await galiaFrame.locator('#galiaClose').waitFor({ state: 'visible' });

  await galiaFrame.locator('.g-tab[data-tab="ship"]').click({ force: true });
  await galiaFrame.locator('[data-galia-services]').waitFor({ state: 'visible' });
  await galiaFrame.locator('text=3 / 12').waitFor({ state: 'visible' });

  await galiaFrame.locator('.g-tab[data-tab="map"]').click({ force: true });
  assert.equal(await galiaFrame.locator('[data-action="travel:jorvik"]').isDisabled(), true, 'undiscovered sectors must be disabled on mobile');
  await galiaFrame.locator('[data-action="travel:cinder"]').click({ force: true });
  assert.equal(await galiaFrame.locator('[data-action="travel:saand"]').isDisabled(), false, 'travelling a valid route must reveal the next linked sector');

  await page.waitForTimeout(150);
  const campaignResult = await galiaFrame.evaluate(() => {
    const game = window.SAGGalia;
    game.state.campaignStep = 3;
    const before = game.state.credits;
    const result = game.chooseCampaign(1);
    return { ok: result.ok, delta: game.state.credits - before, creditFlag: Object.hasOwn(game.state.flags, 'credits') };
  });
  assert.deepEqual(campaignResult, { ok: true, delta: 400, creditFlag: false });

  await galiaFrame.locator('#galiaClose').click({ force: true });
  await galiaFrame.locator('#galiaShell.g-hidden').waitFor();
  await galiaFrame.locator('[data-kiwimi-depth]').waitFor({ state: 'visible' });
  assert.equal(await galiaFrame.locator('[data-kiwimi-depth]').count(), 1);
  console.log('Sprint 42 unified-menu mobile browser regression passed');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
