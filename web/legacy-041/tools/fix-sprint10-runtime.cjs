const fs = require('fs');

const runtimeFile = 'sprint10-source.js';
let source = fs.readFileSync(runtimeFile, 'utf8');
const broken = "hitTarget(target,2.6*player.damageMul,'laser')}}}}\n let dx";
const fixed = "hitTarget(target,2.6*player.damageMul,'laser')}}}\n let dx";
if (!source.includes(broken)) throw new Error('Expected carrier update boundary not found');
source = source.replace(broken, fixed);
fs.writeFileSync(runtimeFile, source);

const htmlFile = 'sprint10.html';
let html = fs.readFileSync(htmlFile, 'utf8');
html = html.replace('F R O N T I E R&nbsp;&nbsp; P A T H', 'D E E P&nbsp;&nbsp; S P A C E');
fs.writeFileSync(htmlFile, html);

console.log('Fixed Deep Space runtime boundary and release wordmark');
