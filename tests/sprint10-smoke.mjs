import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

const save = {
  version: 10, language: 'de', credits: 12000, cores: 40, skillPoints: 8, best: 0, pilotXp: 900, pilotRank: 7,
  selectedSector: 'outer', difficulty: 'explorer', adaptiveAssist: 0, techPity: 0, explorationBest: 0,
  sectorProgress: { outer: 1, debris: 1, crimson: 1 },
  weapons: { laser:{unlocked:true,level:3},rail:{unlocked:true,level:2},rocket:{unlocked:true,level:2},plasma:{unlocked:true,level:2},arc:{unlocked:true,level:2},flak:{unlocked:true,level:2} },
  ships: { vanguard:{unlocked:true,level:2},interceptor:{unlocked:true,level:2},bastion:{unlocked:true,level:2},specter:{unlocked:true,level:2},carrier:{unlocked:true,level:2} },
  modules: { targeting:{unlocked:true,level:2},salvage:{unlocked:true,level:2},capacitor:{unlocked:true,level:2},armor:{unlocked:true,level:2},magnet:{unlocked:true,level:2},amplifier:{unlocked:true,level:2} },
  skills: { hull:1,speed:1,recovery:0,lastStand:0,damage:1,crit:0,chipTech:0,overcharge:0,cooldown:1,salvage:1,magnetism:0,coreHunter:0 },
  loadout: { ship:'carrier',primary:'plasma',secondary:'arc',module:'targeting' },
  stats: { runs:3,kills:0,bosses:0,creditsEarned:0,skillPointsEarned:0,pilotXpEarned:0,discoveries:0,stations:0,asteroids:0 }
};

await page.addInitScript(value => {
  localStorage.setItem('sag-frontier-intro-seen-v06', '1');
  localStorage.setItem('sag-frontier-save-v05', JSON.stringify(value));
}, save);

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'networkidle' });
await page.waitForURL(/sprint10\.html$/);
await page.waitForFunction(() => document.querySelectorAll('#weaponGrid .card').length === 6);

const hangar = await page.evaluate(() => ({
  title: document.title,
  deepBrief: Boolean(document.querySelector('.deep-space-brief')),
  explorationHud: Boolean(document.querySelector('#explorationText')),
  ships: document.querySelectorAll('#shipGrid .card').length,
  modules: document.querySelectorAll('#moduleGrid .card').length,
  skills: document.querySelectorAll('#skillGrid .skill-node').length
}));
if (!hangar.title.includes('Deep Space 0.10') || !hangar.deepBrief || !hangar.explorationHud) throw new Error(`Deep Space UI missing: ${JSON.stringify(hangar)}`);
if (hangar.ships !== 5 || hangar.modules !== 6 || hangar.skills !== 12) throw new Error(`Existing progression regressed: ${JSON.stringify(hangar)}`);

await page.click('#startRunBtn');
await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
await page.waitForFunction(() => window.__SAG10__?.snapshot().objects > 0);
const start = await page.evaluate(() => window.__SAG10__.snapshot());
if (start.player.ship !== 'carrier' || start.player.module !== 'targeting') throw new Error(`Loadout identity missing: ${JSON.stringify(start)}`);
if (start.chunks < 25 || start.objects < 10) throw new Error(`Procedural start region incomplete: ${JSON.stringify(start)}`);

await page.keyboard.down('d');
await page.waitForTimeout(4800);
await page.keyboard.up('d');
await page.waitForTimeout(300);
const moved = await page.evaluate(() => window.__SAG10__.snapshot());
if (moved.player.x < 900) throw new Error(`Player remained screen-bound: ${JSON.stringify(moved)}`);
if (moved.chunks <= start.chunks) throw new Error(`World did not expand procedurally: ${JSON.stringify({start,moved})}`);
if (Math.abs(moved.camera.x - moved.player.x) > 180) throw new Error(`Camera did not follow world player: ${JSON.stringify(moved)}`);
if (!document.querySelector('#explorationText')?.textContent.includes('DISTANZ')) throw new Error('Exploration HUD did not update');
if (moved.objects > 180) throw new Error(`World generation is not bounded enough for a short run: ${moved.objects}`);
if (errors.length) throw new Error(errors.join('\n'));

await browser.close();
console.log('Sprint 0.10 browser smoke passed', hangar, start, moved);
