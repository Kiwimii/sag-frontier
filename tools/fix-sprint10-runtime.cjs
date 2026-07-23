const fs = require('fs');
const file = 'sprint10-source.js';
let source = fs.readFileSync(file, 'utf8');
const broken = "hitTarget(target,2.6*player.damageMul,'laser')}}}}\n let dx";
const fixed = "hitTarget(target,2.6*player.damageMul,'laser')}}}\n let dx";
if (!source.includes(broken)) throw new Error('Expected carrier update boundary not found');
source = source.replace(broken, fixed);
fs.writeFileSync(file, source);
console.log('Fixed Deep Space update boundary');
