const fs = require('fs');

const source = fs.readFileSync('sprint13-source.js', 'utf8');
const html = fs.readFileSync('sprint13.html', 'utf8');
const css = fs.readFileSync('sprint13.bundle.css', 'utf8');
const config = fs.readFileSync('sprint13-config.js', 'utf8');

const requiredSource = [
  "window.SAG13_CONFIG",
  "function frontierTierForDistance",
  "function createFrontierObject",
  "function renderTradePost",
  "function purchaseTradeBuff",
  "function activateBeacon",
  "function openVault",
  "function triggerAnomaly",
  "function enterRift",
  "name:'hunter'",
  "name:'sniper'",
  "name:'miner'",
  "name:'sentinel'",
  "name:'phase'",
  "const bossProfiles=CONFIG.outerFrontier.bosses",
  "function updateEnemies",
  "function updateBoss",
  "window.__SAG13__"
];
for (const fragment of requiredSource) {
  if (!source.includes(fragment)) throw new Error(`Missing Outer Frontier runtime guard: ${fragment}`);
}

const requiredConfig = [
  "version: 13",
  "min: 1500",
  "min: 3200",
  "min: 5500",
  "tradePost",
  "beacon",
  "vault",
  "anomaly",
  "rift",
  "overclock",
  "label: 'FRONTIER WARDEN'",
  "label: 'SIEGE WARDEN'",
  "label: 'CARRIER PRIME'",
  "label: 'VOID HUNTER'",
  "label: 'RIFT ARCHITECT'",
  "architect"
];
for (const fragment of requiredConfig) {
  if (!config.includes(fragment)) throw new Error(`Missing Outer Frontier config guard: ${fragment}`);
}

for (const fragment of ['Outer Frontier 0.13', 'sprint13.bundle.css', 'sprint13-config.js', 'sprint13-source.js', 'id="tradeOverlay"', 'id="tradeChoices"']) {
  if (!html.includes(fragment)) throw new Error(`Missing Sprint 13 HTML guard: ${fragment}`);
}
for (const fragment of ['.frontier-trade', '.trade-choices', '.trade-choice']) {
  if (!css.includes(fragment)) throw new Error(`Missing Sprint 13 CSS guard: ${fragment}`);
}
if (html.includes('sprint12-source.js') || html.includes('sprint12-config.js')) throw new Error('Sprint 13 still loads old runtime entrypoints');
console.log('Sprint 0.13 Outer Frontier static guards passed');
