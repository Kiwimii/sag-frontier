import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

const save = {
  version: 13, language: 'de', credits: 12000, cores: 40, skillPoints: 8, best: 0, pilotXp: 900, pilotRank: 7,
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
await page.waitForURL(/sprint13\.html$/);
await page.waitForFunction(() => document.querySelectorAll('#weaponGrid .card').length === 6);

const architecture = await page.evaluate(() => ({
  title: document.title,
  configVersion: window.SAG13_CONFIG?.version,
  frozen: Object.isFrozen(window.SAG13_CONFIG) && Object.isFrozen(window.SAG13_CONFIG.outerFrontier),
  tiers: window.SAG13_CONFIG?.outerFrontier?.tiers?.length,
  bosses: window.SAG13_CONFIG?.outerFrontier?.bosses?.length,
  tradeBuffs: Object.keys(window.SAG13_CONFIG?.outerFrontier?.tradeBuffs || {}).length
}));
if (!architecture.title.toUpperCase().includes('OUTER FRONTIER 0.13')) throw new Error(`Wrong title: ${JSON.stringify(architecture)}`);
if (architecture.configVersion !== 13 || !architecture.frozen || architecture.tiers !== 4 || architecture.bosses !== 5 || architecture.tradeBuffs !== 6) throw new Error(`Outer Frontier bootstrap failed: ${JSON.stringify(architecture)}`);

await page.click('#startRunBtn');
await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
await page.waitForFunction(() => window.__SAG13__?.snapshot().objects > 0);

const fringe = await page.evaluate(() => window.__SAG13__.snapshot());
if (fringe.frontierTier !== 0) throw new Error(`Wrong origin tier: ${JSON.stringify(fringe)}`);

await page.evaluate(() => window.__SAG13__.teleport(1700, 0));
const deep = await page.evaluate(() => ({
  snapshot: window.__SAG13__.snapshot(),
  discoveries: window.__SAG13__.availableDiscoveries(1700),
  enemies: window.__SAG13__.availableEnemies(1700)
}));
if (deep.snapshot.frontierTier !== 1 || !deep.discoveries.includes('tradePost') || !deep.discoveries.includes('beacon') || !deep.enemies.includes('hunter') || !deep.enemies.includes('sniper')) {
  throw new Error(`Deep Space unlocks failed: ${JSON.stringify(deep)}`);
}

await page.evaluate(() => window.__SAG13__.teleport(3500, 0));
const voidTier = await page.evaluate(() => ({
  snapshot: window.__SAG13__.snapshot(),
  discoveries: window.__SAG13__.availableDiscoveries(3500),
  enemies: window.__SAG13__.availableEnemies(3500)
}));
if (voidTier.snapshot.frontierTier !== 2 || !voidTier.discoveries.includes('vault') || !voidTier.discoveries.includes('anomaly') || !voidTier.enemies.includes('miner') || !voidTier.enemies.includes('sentinel')) {
  throw new Error(`Void unlocks failed: ${JSON.stringify(voidTier)}`);
}

await page.evaluate(() => window.__SAG13__.teleport(5900, 0));
const abyss = await page.evaluate(() => ({
  snapshot: window.__SAG13__.snapshot(),
  discoveries: window.__SAG13__.availableDiscoveries(5900),
  enemies: window.__SAG13__.availableEnemies(5900)
}));
if (abyss.snapshot.frontierTier !== 3 || !abyss.discoveries.includes('rift') || !abyss.enemies.includes('phase')) throw new Error(`Abyss unlocks failed: ${JSON.stringify(abyss)}`);

const beforeTrade = await page.evaluate(() => {
  window.__SAG13__.grantRunCredits(500);
  return window.__SAG13__.snapshot();
});
const tradeResult = await page.evaluate(() => {
  const ok = window.__SAG13__.buyTradeBuff('overclock');
  return { ok, snapshot: window.__SAG13__.snapshot() };
});
if (!tradeResult.ok || !tradeResult.snapshot.runBuffs.overclock || tradeResult.snapshot.runCredits >= beforeTrade.runCredits || tradeResult.snapshot.player.damage <= beforeTrade.player.damage) {
  throw new Error(`Run-long trade buff failed: ${JSON.stringify({ beforeTrade, tradeResult })}`);
}

const enemySpawn = await page.evaluate(() => {
  window.__SAG13__.spawnEnemyType('phase');
  return window.__SAG13__.snapshot();
});
if (!enemySpawn.enemyTypes.includes('phase')) throw new Error(`Distance enemy spawn failed: ${JSON.stringify(enemySpawn)}`);

const bossTypes = [];
for (const id of ['warden', 'siege', 'carrier', 'hunter', 'architect']) {
  bossTypes.push(await page.evaluate(value => window.__SAG13__.spawnBossType(value), id));
}
if (bossTypes.join(',') !== 'warden,siege,carrier,hunter,architect') throw new Error(`Boss roster failed: ${bossTypes}`);

await page.keyboard.press('p');
await page.waitForFunction(() => !document.querySelector('#pauseOverlay').classList.contains('hidden'));
await page.keyboard.press('p');
await page.waitForFunction(() => document.querySelector('#pauseOverlay').classList.contains('hidden'));

if (errors.length) throw new Error(errors.join('\n'));
await browser.close();
console.log('Sprint 0.13 Outer Frontier browser smoke passed', architecture, deep, voidTier, abyss, tradeResult.snapshot, bossTypes);
