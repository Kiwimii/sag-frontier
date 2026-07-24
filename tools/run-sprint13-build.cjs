const fs = require('fs');

let source = fs.readFileSync('tools/build-sprint13.cjs', 'utf8');

const insertionStart = source.indexOf(
  'runtime = replaceSection(\n  runtime,\n  "function update(dt){"'
);
if (insertionStart < 0) throw new Error('Sprint 13 combat helper insertion block not found');

const insertionLabel = source.indexOf("'combat helper insertion'", insertionStart);
if (insertionLabel < 0) throw new Error('Sprint 13 combat helper insertion label not found');

const insertionEndMarker = source.indexOf(');\n', insertionLabel);
if (insertionEndMarker < 0) throw new Error('Sprint 13 combat helper insertion end not found');
const insertionEnd = insertionEndMarker + 3;
const insertionBlock = source.slice(insertionStart, insertionEnd);
source = source.slice(0, insertionStart) + source.slice(insertionEnd);

const bossLabel = source.indexOf("'boss behavior dispatch'");
if (bossLabel < 0) throw new Error('Sprint 13 boss dispatch block not found');
const bossEndMarker = source.indexOf(');\n', bossLabel);
if (bossEndMarker < 0) throw new Error('Sprint 13 boss dispatch end not found');
const bossEnd = bossEndMarker + 3;

source = source.slice(0, bossEnd) + '\n' + insertionBlock + source.slice(bossEnd);

const execute = new Function('require', 'process', 'console', 'Buffer', source);
execute(require, process, console, Buffer);
