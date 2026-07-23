import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

const save = {
  version: 11, language: 'de', credits: 12000, cores: 40, skillPoints: 8, best: 0, pilotXp: 900, pilotRank: 7,
  selectedSector: 'outer', difficulty: 'explorer', adaptiveAssist: 0, techPity: 0, explorationBest: 1300,
  settings: { screenShake: true, autoPause: true, radar: true },
  sectorProgress: { outer: 1, debris: 1, crimson: 1 },
  weapons: { laser:{unlocked:true,level:3},rail:{unlocked:true,level:2},rocket:{unlocked:true,level:2},plasma:{unlocked:true,level:2},arc:{unlocked:true,level:2},flak:{unlocked:true,level:2} },
  ships: { vanguard:{unlocked:true,level:2},interceptor:{unlocked:true,level:2},bastion:{unlocked:true,level:2},specter:{unlocked:true,level:2},carrier:{unlocked:true,level:2} },
  modules: { targeting:{unlocked:true,level:2},salvage:{unlocked:true,level:2},capacitor:{unlocked:true,level:2},armor:{unlocked:true,level:2},magnet:{unlocked:true,level:2},amplifier:{unlocked:true,level:2} },
  skills: { hull:1,speed:1,recovery:0,lastStand:0,damage:1,crit:0,chipTech:0,overcharge:0,cooldown:1,salvage:1,magnetism:0,coreHunter:0 },
  loadout: { ship:'carrier',primary:'plasma',secondary:'arc',module:'targeting' },
  stats: { runs:3,kills:0,bosses:0,creditsEarned:0,skillPointsEarned:0,pilotXpEarned:0,discoveries:7,stations:1,asteroids:2,distance:2400 }
};

await page.addInitScript(value => {
  localStorage.setItem('sag-frontier-intro-seen-v06', '1');
  localStorage.setItem('sag-frontier-save-v05', JSON.stringify(value));
}, save);

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'networkidle' });
await page.waitForURL(/sprint11\.html$/);
await page.waitForFunction(() => document.querySelectorAll('#weaponGrid .card').length === 6);

const hangar = await page.evaluate(() => ({
  title: document.title,
  weapons: document.querySelectorAll('#weaponGrid .card').length,
  ships: document.querySelectorAll('#shipGrid .card').length,
  modules: document.querySelectorAll('#moduleGrid .card').length,
  skills: document.querySelectorAll('#skillGrid .skill-node').length,
  evolutions: document.querySelectorAll('#weaponGrid .evolution-note').length,
  passives: document.querySelectorAll('#shipGrid .passive-note').length,
  synergies: document.querySelectorAll('#moduleGrid .synergy-note').length,
  record: document.querySelector('#explorationRecordValue')?.textContent,
  discoveries: document.querySelector('#explorationRecordDiscoveries')?.textContent
}));
if (!hangar.title.toUpperCase().includes('DEEP SPACE REFINED 0.11')) throw new Error(`Wrong title: ${JSON.stringify(hangar)}`);
if (hangar.weapons !== 6 || hangar.ships !== 5 || hangar.modules !== 6 || hangar.skills !== 12) throw new Error(`Progression regressed: ${JSON.stringify(hangar)}`);
if (hangar.evolutions !== 6 || hangar.passives !== 5 || hangar.synergies !== 6) throw new Error(`Mechanic explanations missing: ${JSON.stringify(hangar)}`);
if (hangar.record !== '1300' || hangar.discoveries !== '7') throw new Error(`Exploration record missing: ${JSON.stringify(hangar)}`);

await page.click('#tabData');
await page.fill('#importArea', '');
await page.type('#importArea', 'pe p 123');
if ((await page.inputValue('#importArea')) !== 'pe p 123') throw new Error('Gameplay keyboard handler still blocks form input');
if (!(await page.locator('#copyExportBtn').isVisible())) throw new Error('Copy save action missing');

await page.click('#tabDeployment');
await page.click('#startRunBtn');
await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
await page.waitForFunction(() => window.__SAG11__?.snapshot().objects > 0);
const start = await page.evaluate(() => window.__SAG11__.snapshot());
if (start.player.ship !== 'carrier' || start.player.module !== 'targeting') throw new Error(`Loadout identity missing: ${JSON.stringify(start)}`);
if (start.activeChunks !== 25 || start.objects > 90) throw new Error(`Active world stream not bounded: ${JSON.stringify(start)}`);

await page.keyboard.down('d');
await page.waitForTimeout(4800);
await page.keyboard.up('d');
await page.waitForTimeout(250);
const moved = await page.evaluate(() => window.__SAG11__.snapshot());
if (moved.player.x < 900 || moved.travelDistance < 900) throw new Error(`World movement or route tracking failed: ${JSON.stringify(moved)}`);
if (moved.chunks <= start.chunks || moved.activeChunks !== 25 || moved.objects > 90) throw new Error(`Procedural streaming failed: ${JSON.stringify({start,moved})}`);
if (Math.abs(moved.camera.x - moved.player.x) > 180) throw new Error(`Camera follow regressed: ${JSON.stringify(moved)}`);

await page.evaluate(() => { window.__SAG11__.teleport(2000, 0); window.__SAG11__.setExploreDirective(4); });
await page.keyboard.down('a');
await page.waitForTimeout(1700);
await page.keyboard.up('a');
const backtrack = await page.evaluate(() => window.__SAG11__.snapshot());
if (!backtrack.directive || backtrack.directive.type !== 'explore' || backtrack.directive.progress < 3) throw new Error(`Explore directive still depends on maximum radius: ${JSON.stringify(backtrack)}`);

await page.evaluate(() => { for (let i = 0; i < 230; i++) window.__SAG11__.teleport(i * 910, (i % 3) * 910); });
const streamed = await page.evaluate(() => window.__SAG11__.snapshot());
if (streamed.chunks > 180 || streamed.activeChunks !== 25 || streamed.objects > 90) throw new Error(`Chunk cache or active object count is unbounded: ${JSON.stringify(streamed)}`);

await page.evaluate(() => window.__SAG11__.capUpgrades());
const cappedUpgrades = await page.evaluate(() => window.__SAG11__.upgradeIds());
for (const id of ['rate','multi','emp','laserBurn','railWidth','rocketCluster','plasmaField','arcChain','flakGuard']) if (cappedUpgrades.includes(id)) throw new Error(`Maxed no-op upgrade remains selectable: ${id}`);

await page.keyboard.press('p');
await page.waitForFunction(() => !document.querySelector('#pauseOverlay').classList.contains('hidden'));
if (!(await page.locator('#screenShakeToggle').isChecked())) throw new Error('Pause settings did not load');
await page.uncheck('#radarToggle');
const storedRadar = await page.evaluate(() => JSON.parse(localStorage.getItem('sag-frontier-save-v05')).settings.radar);
if (storedRadar !== false) throw new Error('Pause setting did not persist');
await page.keyboard.press('p');
await page.waitForFunction(() => document.querySelector('#pauseOverlay').classList.contains('hidden'));

const explorationLabel = await page.textContent('#explorationText');
if (!explorationLabel?.includes('ROUTE')) throw new Error(`Exploration HUD lacks route information: ${explorationLabel}`);
if (errors.length) throw new Error(errors.join('\n'));
await browser.close();
console.log('Sprint 0.11 browser smoke passed', hangar, start, moved, streamed);
