import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

await page.addInitScript(() => {
  localStorage.setItem('sag-frontier-intro-seen-v06', '1');
  localStorage.setItem('sag-frontier-save-v05', JSON.stringify({
    version: 7,
    language: 'de',
    credits: 10000,
    cores: 30,
    skillPoints: 4,
    weapons: {
      laser: { unlocked: true, level: 1 }, rail: { unlocked: true, level: 1 }, rocket: { unlocked: true, level: 1 },
      plasma: { unlocked: true, level: 1 }, arc: { unlocked: true, level: 1 }, flak: { unlocked: true, level: 1 }
    },
    ships: {
      vanguard: { unlocked: true, level: 1 }, interceptor: { unlocked: true, level: 1 }, bastion: { unlocked: true, level: 1 },
      specter: { unlocked: true, level: 1 }, carrier: { unlocked: true, level: 1 }
    },
    modules: {
      targeting: { unlocked: true, level: 1 }, salvage: { unlocked: true, level: 1 }, capacitor: { unlocked: true, level: 1 },
      armor: { unlocked: true, level: 1 }, magnet: { unlocked: true, level: 1 }, amplifier: { unlocked: true, level: 1 }
    },
    skills: { hull: 0, damage: 0, cooldown: 0, salvage: 0, crit: 0, speed: 0 },
    loadout: { ship: 'specter', primary: 'plasma', secondary: 'arc', module: 'magnet' },
    stats: { runs: 0, kills: 0, bosses: 0, creditsEarned: 0, skillPointsEarned: 0 }
  }));
});

await page.goto('http://127.0.0.1:4173/sprint07.html', { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelectorAll('#weaponGrid .card').length === 6);

const counts = await page.evaluate(() => ({
  weapons: document.querySelectorAll('#weaponGrid .card').length,
  ships: document.querySelectorAll('#shipGrid .card').length,
  modules: document.querySelectorAll('#moduleGrid .card').length
}));
if (counts.weapons !== 6 || counts.ships !== 5 || counts.modules !== 6) throw new Error(`Unexpected arsenal counts: ${JSON.stringify(counts)}`);

await page.click('#tabSkills');
await page.waitForFunction(() => document.querySelectorAll('#skillGrid .skill-node').length === 6);
const pointsBefore = Number(await page.textContent('#skillPointsValue'));
await page.locator('#skillGrid .skill-node').first().locator('button').click();
await page.waitForTimeout(100);
const pointsAfter = Number(await page.textContent('#skillPointsValue'));
if (!(pointsAfter < pointsBefore)) throw new Error('Permanent skill purchase did not consume skill points');

await page.click('#tabDeployment');
await page.click('#startRunBtn');
await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
await page.waitForTimeout(3500);
const combat = await page.evaluate(() => ({
  title: document.querySelector('#gameTitle')?.textContent,
  weapon: document.querySelector('#weaponText')?.textContent,
  majorStatusExists: Boolean(document.querySelector('#majorStatus')),
  canvasWidth: document.querySelector('#game')?.width || 0
}));
if (!combat.title.includes('ASCENSION 0.7')) throw new Error(`Wrong game title: ${combat.title}`);
if (!combat.weapon.includes('Plasma') && !combat.weapon.includes('Plasma')) throw new Error(`Expanded weapon loadout not active: ${combat.weapon}`);
if (!combat.majorStatusExists || combat.canvasWidth <= 0) throw new Error(`Combat UI incomplete: ${JSON.stringify(combat)}`);
if (errors.length) throw new Error(errors.join('\n'));

await browser.close();
console.log('Sprint 0.7 browser smoke passed', counts, combat);
