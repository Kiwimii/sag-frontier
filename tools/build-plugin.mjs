import { access, cp, mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const source = path.join(root, 'wordpress', 'sag-frontier-game');
const gameEntry = path.join(source, 'public', 'game', 'index.html');
const stagingRoot = path.join(root, '.build');
const stagingPlugin = path.join(stagingRoot, 'sag-frontier-game');
const dist = path.join(root, 'dist');
const archive = path.join(dist, 'sag-frontier-game.zip');

try {
  await access(gameEntry);
} catch {
  throw new Error('Godot web export missing. Run `npm run export:web` before `npm run build`.');
}

await rm(stagingRoot, { recursive: true, force: true });
await mkdir(stagingRoot, { recursive: true });
await mkdir(dist, { recursive: true });
await rm(archive, { force: true });
await cp(source, stagingPlugin, { recursive: true });

const command = process.platform === 'win32' ? 'powershell.exe' : 'zip';
const args = process.platform === 'win32'
  ? ['-NoProfile', '-Command', `Compress-Archive -Path "${stagingPlugin}" -DestinationPath "${archive}" -Force`]
  : ['-qr', archive, 'sag-frontier-game'];

await new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: process.platform === 'win32' ? root : stagingRoot,
    stdio: 'inherit',
  });
  child.on('error', reject);
  child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Build failed with exit code ${code}`)));
});

await rm(stagingRoot, { recursive: true, force: true });
console.log(`Built ${archive}`);
