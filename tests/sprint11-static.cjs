const fs = require('fs');
const source = fs.readFileSync('sprint11-source.js', 'utf8');
const html = fs.readFileSync('sprint11.html', 'utf8');
const css = fs.readFileSync('sprint11.css', 'utf8');

const requiredSource = [
  "version:11",
  "settings:{screenShake:true,autoPause:true,radar:true}",
  "const CHUNK_SIZE=900,WORLD_RADIUS=2,CHUNK_CACHE_LIMIT=180",
  "function refreshActiveWorld(cx,cy)",
  "function trimWorldCache(cx,cy)",
  "function nearestDiscovery()",
  "function drawDiscoveryCompass()",
  "directiveStartTravel=travelDistance",
  "Math.floor((travelDistance-directiveStartTravel)/100)",
  "type==='tech'?1:25+Math.floor",
  "for(const o of worldObjects)if(o.type==='asteroid'&&!o.dead&&!o.looted)hit(o)",
  "if(boss&&!boss.dead&&Math.hypot(boss.x-f.x,boss.y-f.y)<f.r+boss.r)",
  "if(player.multi<3)",
  "player.rateMul>.56",
  "function clearControls()",
  "isFormTarget(e.target)",
  "document.addEventListener('visibilitychange'",
  "hudClock=.1;updateHUD()",
  "worldMemory.set(o.id",
  "window.__SAG11__"
];
for (const fragment of requiredSource) if (!source.includes(fragment)) throw new Error(`Missing Sprint 0.11 guard: ${fragment}`);

const forbiddenSource = [
  "directiveStartDistance",
  "worldObjects=worldObjects.filter(o=>!o.dead||",
  "value:i===2?1:",
  "player.x=Math.max(24,Math.min(W-24,player.x))",
  "sort((a,b)=>Math.hypot(a.x-player.x"
];
for (const fragment of forbiddenSource) if (source.includes(fragment)) throw new Error(`Obsolete or buggy runtime fragment remains: ${fragment}`);

const requiredHtml = [
  'Deep Space Refined 0.11','sprint11-source.js','sprint11.css','id="copyExportBtn"','id="restartRunBtn"','id="abandonRunBtn"','id="screenShakeToggle"','id="sumDistance"','id="sumDiscoveries"','Permanenter Skill Tree','role="application"','id="weaponsSectionNote"','id="skillTreeNote"'
];
for (const fragment of requiredHtml) if (!html.includes(fragment)) throw new Error(`Missing Sprint 0.11 HTML guard: ${fragment}`);
if (!css.includes('.mechanic-note') || !css.includes('.pause-settings') || !css.includes('display:block!important')) throw new Error('Sprint 0.11 responsive UX styles are incomplete');
console.log('Sprint 0.11 static quality guards passed');
