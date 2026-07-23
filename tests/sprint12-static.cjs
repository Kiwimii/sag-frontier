const fs = require('fs');

const html = fs.readFileSync('sprint12.html', 'utf8');
const runtime = fs.readFileSync('sprint12-source.js', 'utf8');
const css = fs.readFileSync('sprint12.bundle.css', 'utf8');
const ui = fs.readFileSync('sprint12-ui.js', 'utf8');
const config = fs.readFileSync('sprint12-config.js', 'utf8');

const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match => match[1]);
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
if (links.length !== 1 || links[0] !== 'sprint12.bundle.css') throw new Error(`CSS not consolidated: ${links.join(', ')}`);
if (scripts.join(',') !== 'sprint12-config.js,sprint12-source.js,sprint12-ui.js') throw new Error(`JS load order invalid: ${scripts.join(', ')}`);

for (const fragment of [
  'const CONFIG=window.SAG12_CONFIG',
  'CONFIG.world.chunkSize',
  'CONFIG.world.cacheLimit',
  'CONFIG.enemyLimits[save.difficulty]',
  'CONFIG.performance.hudInterval',
  'CONFIG.rewards.minimumRunCredits',
  'CONFIG.rewards.techPityRuns',
  'window.__SAG12__'
]) if (!runtime.includes(fragment)) throw new Error(`Runtime is not config-driven: ${fragment}`);

for (const legacy of ['window.__SAG11__', 'const CHUNK_SIZE=900', 'sprint10.css', 'sprint11-source.js']) {
  if (runtime.includes(legacy) || html.includes(legacy)) throw new Error(`Legacy coupling remains: ${legacy}`);
}

if (!config.includes('deepFreeze') || !config.includes('window.SAG12_CONFIG')) throw new Error('Balance config is not immutable or globally available');
if (!css.includes('sprint05.css') || !css.includes('sprint11.css')) throw new Error('Consolidated CSS is incomplete');
if (!ui.includes('sprint06-branding.js') || !ui.includes('sprint11-branding.js')) throw new Error('Consolidated UI bundle is incomplete');
console.log('Sprint 0.12 modular static guards passed');
