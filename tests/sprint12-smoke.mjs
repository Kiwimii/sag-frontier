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
  cssSheets: [...document.styleSheets].filter(sheet => sheet.href).map(sheet => new URL(sheet.href).pathname.split('/').pop()),
  weapons: document.querySelectorAll('#weaponGrid .card').length,
  ships: document.querySelectorAll('#shipGrid .card').length,
  modules: document.querySelectorAll('#moduleGrid .card').length,
  skills: document.querySelectorAll('#skillGrid .skill-node').length
}));
if (!architecture.title.toUpperCase().includes('MODULAR DEEP SPACE 0.12')) throw new Error(`Wrong title: ${JSON.stringify(architecture)}`);
if (architecture.configVersion !== 12 || !architecture.frozen) throw new Error(`Balance config bootstrap failed: ${JSON.stringify(architecture)}`);
if (architecture.cssSheets.length !== 1 || architecture.cssSheets[0] !== 'sprint12.bundle.css') throw new Error(`Styles not consolidated: ${JSON.stringify(architecture)}`);
if (architecture.weapons !== 6 || architecture.ships !== 5 || architecture.modules !== 6 || architecture.skills !== 12) throw new Error(`Hangar content regressed: ${JSON.stringify(architecture)}`);

await page.click('#startRunBtn');
await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
const initialTime = await page.textContent('#timeText');
await page.keyboard.down('d');
await page.waitForTimeout(1600);
await page.keyboard.up('d');
await page.waitForTimeout(500);
const laterTime = await page.textContent('#timeText');
if (initialTime === laterTime) throw new Error(`Runtime did not advance: ${initialTime}`);

await page.keyboard.press('p');
await page.waitForFunction(() => !document.querySelector('#pauseOverlay').classList.contains('hidden'));
await page.keyboard.press('p');
await page.waitForFunction(() => document.querySelector('#pauseOverlay').classList.contains('hidden'));

if (errors.length) throw new Error(errors.join('\n'));
await browser.close();
console.log('Sprint 0.12 modular browser smoke passed', architecture, { initialTime, laterTime });
