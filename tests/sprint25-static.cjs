const fs=require('node:fs');
const assert=require('node:assert/strict');

const required=[
  'sprint25.html','sprint21-lore-bible.js','sprint22-dialogue.js','sprint22-dialogue.css',
  'sprint23-faction-paths.js','sprint23-faction-paths.css','sprint24-dac.js','sprint24-dac.css',
  'sprint25-narrative.js','sprint25-narrative.css'
];
required.forEach(file=>assert.ok(fs.statSync(file).size>0,`${file} must exist`));
const html=fs.readFileSync('sprint25.html','utf8');
const index=fs.readFileSync('index.html','utf8');
const lore=fs.readFileSync('sprint21-lore-bible.js','utf8');
const dialogue=fs.readFileSync('sprint22-dialogue.js','utf8');
const faction=fs.readFileSync('sprint23-faction-paths.js','utf8');
const dac=fs.readFileSync('sprint24-dac.js','utf8');
const polish=fs.readFileSync('sprint25-narrative.js','utf8');

assert.match(index,/sprint25\.html\?build=0250/);
assert.match(html,/data-build="0250"/);
assert.ok(html.indexOf('sprint21-lore-bible.js')<html.indexOf('sprint15-cinematic.js'),'lore bible must load before cinematic');
assert.ok(html.indexOf('sprint20-focused.js')<html.indexOf('sprint22-dialogue.js'),'dialogue must extend focused UI');
assert.ok(html.indexOf('sprint24-dac.js')<html.indexOf('sprint25-narrative.js'),'polish must load last');
assert.doesNotMatch(html,/sag-frontier-reset-v025/);
assert.match(lore,/STAR ATLAS KANON/);
assert.match(lore,/SAG DAC/);
assert.match(lore,/SAG FRONTIER FIKTION/);
assert.match(lore,/Convergence War/);
assert.match(lore,/Council of Peace/);
assert.match(lore,/StarPath/);
assert.match(lore,/eigenständige deutschsprachige Gemeinschaft/);
assert.match(dialogue,/Warum eine eigene DAC/);
assert.match(dialogue,/dialogueHistory/);
assert.match(faction,/Mara Voss/);
assert.match(faction,/Eno Vael/);
assert.match(faction,/U-19/);
assert.match(dac,/keine offizielle Mitgliedschaft/);
assert.match(dac,/Vertrauliche Treasury-, Token-/);
assert.match(polish,/Iris und der Cataclysm/i);
assert.match(polish,/KANON · SAG DAC · FIKTION GETRENNT/);
console.log('Sprint 25 static narrative validation passed');