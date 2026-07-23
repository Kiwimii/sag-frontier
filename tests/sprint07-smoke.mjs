import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

const baseSave = {
  version: 7,
  language: 'de',
  credits: 10000,
  cores: 30,
  skillPoints: 4,
  best: 0,
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
};

await page.addInitScript(save => {
  localStorage.setItem('sag-frontier-intro-seen-v06', '1');
  if (!localStorage.getItem('sag-frontier-save-v05')) localStorage.setItem('sag-frontier-save-v05', JSON.stringify(save));
}, baseSave);

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'networkidle' });
await page.waitForURL(/sprint07\.html$/);
await page.waitForFunction(() => document.querySelectorAll('#weaponGrid .card').length === 6);

const runtimeSource = await page.evaluate(async () => fetch('sprint07-source.js').then(response => response.text()));
const requiredRuntimeFragments = [
  "const ready=lastMajorAt===0?elapsed>=45:elapsed-lastMajorAt>=65",
  "if(waveClock>=44&&!boss)advanceWave();maybeMajorUpgrade();",
  "weaponChipsDropped<6&&r<.18",
  "boost.total<8",
  "function drawShip(){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);ctx.globalAlpha=player.invuln>0&&Math.floor(player.invuln*20)%2===0?.38:1;if(player.chipPulse>0)",
  "for(const b of bullets){ctx.fillStyle=b.color||'#ffb35c'"
];
for (const fragment of requiredRuntimeFragments) {
  if (!runtimeSource.includes(fragment)) throw new Error(`Missing runtime regression guard: ${fragment}`);
}
if (/function damagePlayer\([^\n]+ctx\.strokeStyle/.test(runtimeSource)) throw new Error('Weapon pickup rendering leaked into damagePlayer');

const counts = await page.evaluate(() => ({
  weapons: document.querySelectorAll('#weaponGrid .card').length,
  ships: document.querySelectorAll('#shipGrid .card').length,
  modules: document.querySelectorAll('#moduleGrid .card').length
}));
if (counts.weapons !== 6 || counts.ships !== 5 || counts.modules !== 6) throw new Error(`Unexpected arsenal counts: ${JSON.stringify(counts)}`);

await page.click('#tabSkills');
await page.waitForFunction(() => document.querySelectorAll('#skillGrid .skill-node').length === 6);
await page.waitForFunction(() => document.querySelector('#kiwimiContext')?.textContent.includes('ASCENSION'));
const pointsBefore = Number(await page.textContent('#skillPointsValue'));
await page.locator('#skillGrid .skill-node').first().locator('button').click();
await page.waitForTimeout(120);
const pointsAfter = Number(await page.textContent('#skillPointsValue'));
if (!(pointsAfter < pointsBefore)) throw new Error('Permanent skill purchase did not consume skill points');

async function runLoadout(primary, secondary, ship = 'specter') {
  await page.evaluate(({ save, primary, secondary, ship }) => {
    const next = structuredClone(save);
    next.loadout = { ship, primary, secondary, module: 'magnet' };
    localStorage.setItem('sag-frontier-save-v05', JSON.stringify(next));
  }, { save: baseSave, primary, secondary, ship });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#tabDeployment');
  await page.click('#startRunBtn');
  await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
  await page.waitForTimeout(4500);
  return page.evaluate(() => ({
    title: document.querySelector('#gameTitle')?.textContent,
    weapon: document.querySelector('#weaponText')?.textContent,
    majorStatusExists: Boolean(document.querySelector('#majorStatus')),
    canvasWidth: document.querySelector('#game')?.width || 0
  }));
}

const energyCombat = await runLoadout('plasma', 'arc');
if (!energyCombat.title.includes('ASCENSION 0.7')) throw new Error(`Wrong game title: ${energyCombat.title}`);
if (!energyCombat.weapon.includes('Plasma')) throw new Error(`Expanded energy loadout not active: ${energyCombat.weapon}`);
if (!energyCombat.majorStatusExists || energyCombat.canvasWidth <= 0) throw new Error(`Combat UI incomplete: ${JSON.stringify(energyCombat)}`);

const projectileCombat = await runLoadout('rocket', 'flak', 'carrier');
if (!projectileCombat.weapon.includes('Raketen')) throw new Error(`Projectile loadout not active: ${projectileCombat.weapon}`);
if (errors.length) throw new Error(errors.join('\n'));

await browser.close();
console.log('Sprint 0.7 browser smoke passed', counts, energyCombat, projectileCombat);
