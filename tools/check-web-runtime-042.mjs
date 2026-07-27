import { access, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const indexPath = path.join(root, 'web', 'legacy-041', 'index.html');
const releaseRoot = path.join(root, 'web', 'release-042');
const releaseIndex = await readFile(indexPath, 'utf8');
const protectedIndex = '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="cache-control" content="no-cache,no-store,must-revalidate"><meta http-equiv="pragma" content="no-cache"><meta http-equiv="expires" content="0"><title>S.A.G. Frontier — Kiwimi Depth 0.41.1</title><meta http-equiv="refresh" content="0; url=sprint41.html?build=0411"><style>html,body{margin:0;height:100%;display:grid;place-items:center;background:#03070b;color:#f2f2f2;font-family:system-ui,Segoe UI,Arial,sans-serif}a{color:#d7a83c}</style></head><body><p>S.A.G. Frontier 0.41 wird geladen… <a href="sprint41.html?build=0411">Kiwimi Depth öffnen</a></p><script>location.replace(\'sprint41.html?build=0411\')</script></body></html>';

if (!releaseIndex.includes('sprint42.html?build=0420')) {
  throw new Error('The production entry point does not route to build 0.42.');
}

try {
  await writeFile(indexPath, protectedIndex, 'utf8');
  await import(`./check-web-runtime.mjs?base=${Date.now()}`);
} finally {
  await writeFile(indexPath, releaseIndex, 'utf8');
}

for (const file of ['sprint42.html', 'sprint42-month.js', 'sprint42-month.css']) {
  await access(path.join(releaseRoot, file));
}

const monthScript = await readFile(path.join(releaseRoot, 'sprint42-month.js'), 'utf8');
for (const token of ['PRISM REGENT', 'GRAVITY HARVESTER', 'ION TEMPEST', 'WAR FOUNDRY', 'ABYSSAL ORACLE', 'skirmisher', 'commander', 'FRONTIER-ZYKLUS']) {
  if (!monthScript.includes(token)) throw new Error(`Missing 0.42 feature token: ${token}`);
}

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ['--check', path.join(releaseRoot, 'sprint42-month.js')], { stdio: 'inherit' });
  child.on('error', reject);
  child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`0.42 syntax check failed with ${code}`)));
});

console.log('Month of the Frontier 0.42 overlay verified on the protected 0.41.1 runtime.');