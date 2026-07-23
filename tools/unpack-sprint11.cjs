const fs = require('fs');
const zlib = require('zlib');

const parts = Array.from({ length: 6 }, (_, index) => `s11z${String(index).padStart(2, '0')}.txt`);
const encoded = parts.map(path => fs.readFileSync(path, 'utf8').replace(/\s/g, '')).join('');
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
fs.writeFileSync('sprint11-source.js', source);
console.log(`Unpacked Sprint 0.11 runtime: ${source.length} bytes`);
