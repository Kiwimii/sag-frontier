const fs = require('fs');
const zlib = require('zlib');

function unpack(parts, output) {
  const encoded = parts.map(path => fs.readFileSync(path, 'utf8').replace(/\s/g, '')).join('');
  const content = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
  fs.writeFileSync(output, content);
  console.log(`Unpacked ${output}: ${content.length} bytes`);
}

unpack(Array.from({ length: 6 }, (_, index) => `s11z${String(index).padStart(2, '0')}.txt`), 'sprint11-source.js');
unpack(['s11h00.txt'], 'sprint11.html');

const runtimeFile = 'sprint11-source.js';
let runtime = fs.readFileSync(runtimeFile, 'utf8');
const oldHandler = "addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(isFormTarget(e.target))return;const gameplayKey=";
const newHandler = "addEventListener('keydown',e=>{const k=e.key.toLowerCase(),formTarget=isFormTarget(e.target);if(formTarget&&!(state==='paused'&&(k==='p'||k==='escape')))return;const gameplayKey=";
if (!runtime.includes(oldHandler)) throw new Error('Expected Sprint 0.11 keyboard handler not found');
runtime = runtime.replace(oldHandler, newHandler);
fs.writeFileSync(runtimeFile, runtime);
console.log('Patched pause hotkeys to work after changing pause settings');
