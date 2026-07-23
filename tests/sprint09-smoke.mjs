import { chromium } from 'playwright';
import fs from 'node:fs';

const runtime = fs.readFileSync('sprint09-source.js', 'utf8');
const required = [
  "version:9",
  "const sectorDefs={outer:",
  "const difficultyDefs={explorer:",
  "const skillTree={damage:",
  "lastStand:{max:1",
  "coreHunter:{max:1",
  "const ready=lastMajorAt===0?elapsed>=70:elapsed-lastMajorAt>=105",
  "reviveCharges:(save.difficulty==='explorer'",
  "guaranteedRepairAt:(save.stats.runs||0)<5?24:0",
  "save.techPity>=3",
  "save.adaptiveAssist=Math.min(3",
  "function renderSkillTree()",
  "itemVisual('ship',id)",
  "itemVisual('module',id)"
];
for (const fragment of required) {
  if (!runtime.includes(fragment)) throw new Error(`Missing Sprint 0.9 regression guard: ${fragment}`);
}
if (runtime.includes("skillTree?.[id]")) throw new Error('Legacy save normalization still reads skillTree before initialization');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

const save = {
  version: 8,
  language: 'de',
  credits: 12000,
  cores: 40,
  skillPoints: 14,
  best: 2200,
  pilotXp: 1600,
  selectedSector: 'outer',
  difficulty: 'explorer',
  weapons: {
    laser:{unlocked:true,level:2},rail:{unlocked:true,level:1},rocket:{unlocked:true,level:1},plasma:{unlocked:true,level:1},arc:{unlocked:true,level:1},flak:{unlocked:true,level:1}
  },
  ships: {
    vanguard:{unlocked:true,level:2},interceptor:{unlocked:true,level:1},bastion:{unlocked:true,level:1},specter:{unlocked:true,level:1},carrier:{unlocked:true,level:1}
  },
  modules: {
    targeting:{unlocked:true,level:2},salvage:{unlocked:true,level:1},capacitor:{unlocked:true,level:1},armor:{unlocked:true,level:1},magnet:{unlocked:true,level:1},amplifier:{unlocked:true,level:1}
  },
  skills:{hull:0,damage:0,cooldown:0,salvage:0,crit:0,speed:0},
  loadout:{ship:'vanguard',primary:'laser',secondary:'rail',module:'targeting'},
  stats:{runs:2,kills:30,bosses:0,creditsEarned:600,skillPointsEarned:0}
};
await page.addInitScript(initialSave => {
  localStorage.setItem('sag-frontier-intro-seen-v06', '1');
  localStorage.setItem('sag-frontier-save-v05', JSON.stringify(initialSave));
}, save);

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'networkidle' });
await page.waitForURL(/sprint09\.html$/);
await page.waitForFunction(() => document.querySelectorAll('#shipGrid .ship-card').length === 5);

const overview = await page.evaluate(() => ({
  title: document.title,
  rank: document.querySelector('#pilotRankValue')?.textContent,
  sectors: document.querySelectorAll('#sectorMap .sector-node').length,
  shipVisuals: [...document.querySelectorAll('#shipGrid .ship-visual')].map(node => node.className),
  moduleVisuals: [...document.querySelectorAll('#moduleGrid .module-visual')].map(node => node.className),
  difficulty: document.querySelector('#difficultySelect')?.value
}));
if (!overview.title.includes('FRONTIER PATH 0.9')) throw new Error(`Wrong title: ${overview.title}`);
if (Number(overview.rank) < 6) throw new Error(`Pilot rank migration failed: ${overview.rank}`);
if (overview.sectors !== 3 || overview.shipVisuals.length !== 5 || overview.moduleVisuals.length !== 6) throw new Error(`Hangar visual counts failed: ${JSON.stringify(overview)}`);
if (new Set(overview.shipVisuals).size !== 5 || new Set(overview.moduleVisuals).size !== 6) throw new Error('Ship or module visual identities are not distinct');

await page.locator('#sectorMap button[data-sector="crimson"]').click();
await page.selectOption('#difficultySelect', 'operation');
await page.waitForTimeout(100);
const selection = await page.evaluate(() => ({
  selected: document.querySelector('#sectorMap .sector-node.selected')?.dataset.sector,
  difficulty: document.querySelector('#difficultySelect')?.value,
  reward: document.querySelector('#sectorRewardText')?.textContent
}));
if (selection.selected !== 'crimson' || selection.difficulty !== 'operation') throw new Error(`Sector or difficulty selection failed: ${JSON.stringify(selection)}`);

await page.click('#tabSkills');
await page.waitForFunction(() => document.querySelectorAll('#skillGrid .skill-node').length === 12);
const tree = await page.evaluate(() => ({
  branches: document.querySelectorAll('#skillGrid .skill-branch').length,
  nodes: document.querySelectorAll('#skillGrid .skill-node').length,
  lockedCrit: document.querySelector('[data-skill="crit"]')?.classList.contains('locked'),
  lockedLastStand: document.querySelector('[data-skill="lastStand"]')?.classList.contains('locked')
}));
if (tree.branches !== 3 || tree.nodes !== 12 || !tree.lockedCrit || !tree.lockedLastStand) throw new Error(`Skill tree dependencies failed: ${JSON.stringify(tree)}`);

const pointsBefore = Number(await page.textContent('#skillPointsValue'));
await page.locator('[data-skill="damage"] button').click();
await page.waitForTimeout(80);
const pointsAfter = Number(await page.textContent('#skillPointsValue'));
if (!(pointsAfter < pointsBefore)) throw new Error('Root skill purchase did not consume points');

await page.click('#tabDeployment');
await page.click('#startRunBtn');
await page.waitForFunction(() => !document.querySelector('#hud').classList.contains('hidden'));
await page.waitForTimeout(3500);
const combat = await page.evaluate(() => ({
  title: document.querySelector('#gameTitle')?.textContent,
  wave: document.querySelector('#waveText')?.textContent,
  canvas: document.querySelector('#game')?.width || 0,
  hp: document.querySelector('#hpText')?.textContent
}));
if (!combat.title.includes('FRONTIER PATH 0.9') || !combat.wave.includes('ROTE ZONE') || combat.canvas <= 0 || !combat.hp) throw new Error(`Combat start failed: ${JSON.stringify(combat)}`);
if (errors.length) throw new Error(errors.join('\n'));

await browser.close();
console.log('Sprint 0.9 browser smoke passed', overview, selection, tree, combat);
