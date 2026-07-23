import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

await page.addInitScript(() => localStorage.setItem('sag-frontier-intro-seen-v06', '1'));
await page.goto('http://127.0.0.1:4173/sprint12.html', { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelectorAll('#weaponGrid .card').length === 6);

const architecture = await page.evaluate(() => ({
  title: document.title,
  configVersion: window.SAG12_CONFIG?.version,
  frozen: Object.isFrozen(window.SAG12_CONFIG) && Object.isFrozen(window.SAG12_CONFIG.world),
  cssSheets: [...document.styleSheets].map(sheet => new URL(sheet.href).pathname.split('/').pop()),
  runtimeReady: Boolean(window.__SAG12__),
  legacyRuntime: Boolean(window.__SAG11__)
}));
if (!architecture.title.includes('Modular Deep Space 0.12')) throw new Error(`Wrong title: ${JSON.stringify(architecture)}`);
if (architecture.configVersion !== 12 || !architecture.frozen || !architecture.runtimeReady || architecture.legacyRuntime) throw new Error(`Modular runtime bootstrap failed: ${JSON.stringify(architecture)}`);
if (architecture.cssSheets.length !== 1 || architecture.cssSheets[0] !== 'sprint12.bundle.css') throw new Error(`Styles not consolidated: ${JSON.stringify(architecture)}`);

await page.click('#startRunBtn');
await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
await page.waitForFunction(() => window.__SAG12__?.snapshot().objects > 0);
const start = await page.evaluate(() => window.__SAG12__.snapshot());
if (start.activeChunks !== 25 || start.chunks > 180) throw new Error(`Config-driven world limits failed: ${JSON.stringify(start)}`);

await page.keyboard.down('d');
await page.waitForTimeout(1600);
await page.keyboard.up('d');
const moved = await page.evaluate(() => window.__SAG12__.snapshot());
if (moved.player.x <= start.player.x || moved.travelDistance <= 0) throw new Error(`Gameplay regressed: ${JSON.stringify({ start, moved })}`);

await page.keyboard.press('p');
await page.waitForFunction(() => !document.querySelector('#pauseOverlay').classList.contains('hidden'));
await page.keyboard.press('p');
await page.waitForFunction(() => document.querySelector('#pauseOverlay').classList.contains('hidden'));

if (errors.length) throw new Error(errors.join('\n'));
await browser.close();
console.log('Sprint 0.12 modular browser smoke passed', architecture, start, moved);
