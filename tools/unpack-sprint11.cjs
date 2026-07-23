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
