import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const presetPath = path.join(root, 'godot', 'export_presets.cfg');
const pluginPath = path.join(root, 'wordpress', 'sag-frontier-game', 'sag-frontier-game.php');
const loaderPath = path.join(root, 'wordpress', 'sag-frontier-game', 'assets', 'loader.js');

await Promise.all([access(presetPath), access(pluginPath), access(loaderPath)]);

const preset = await readFile(presetPath, 'utf8');
if (!preset.includes('platform="Web"')) {
  throw new Error('Godot Web export preset is missing or invalid.');
}
if (!preset.includes('public/game/index.html')) {
  throw new Error('Godot export path does not target the WordPress plugin.');
}

console.log('Godot-to-WordPress export wiring is valid.');
