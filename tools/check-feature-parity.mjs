import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const matrixPath = path.join(root, 'docs', 'feature-parity.json');
const allowedStatuses = new Set(['missing', 'partial', 'parity']);
const requiredFeatureIds = new Set([
  'action-combat',
  'command-progression',
  'galia-map',
  'economy-trade',
  'ship-services',
  'events-reputation',
  'sag-campaign',
  'kiwimi-narrative',
  'save-migration',
  'mobile-input',
  'accessibility',
  'pages-deployment',
  'wordpress-packaging',
]);

const matrix = JSON.parse(await readFile(matrixPath, 'utf8'));
if (matrix.schemaVersion !== 1) {
  throw new Error(`Unsupported feature parity schema: ${matrix.schemaVersion}`);
}
if (!Array.isArray(matrix.features)) {
  throw new Error('Feature parity matrix must contain a features array.');
}
if (typeof matrix.godotReleaseAllowed !== 'boolean') {
  throw new Error('godotReleaseAllowed must be a boolean release switch.');
}

await access(path.join(root, matrix.productionRuntime, 'index.html'));
await access(path.join(root, matrix.migrationTarget, 'project.godot'));

const seen = new Set();
for (const feature of matrix.features) {
  if (!feature || typeof feature !== 'object') {
    throw new Error('Every feature parity row must be an object.');
  }
  if (typeof feature.id !== 'string' || !feature.id.trim()) {
    throw new Error('Every feature parity row requires a non-empty id.');
  }
  if (seen.has(feature.id)) {
    throw new Error(`Duplicate feature parity id: ${feature.id}`);
  }
  seen.add(feature.id);

  if (!allowedStatuses.has(feature.godotStatus)) {
    throw new Error(`Invalid Godot status for ${feature.id}: ${feature.godotStatus}`);
  }
  if (feature.requiredForGodotRelease !== true) {
    throw new Error(`${feature.id} must remain an explicit Godot release requirement.`);
  }
  if (!Array.isArray(feature.evidence) || feature.evidence.length === 0) {
    throw new Error(`${feature.id} requires at least one evidence path.`);
  }
  if (typeof feature.nextGate !== 'string' || !feature.nextGate.trim()) {
    throw new Error(`${feature.id} requires a concrete nextGate.`);
  }

  for (const evidencePath of feature.evidence) {
    if (typeof evidencePath !== 'string' || !evidencePath.trim()) {
      throw new Error(`${feature.id} contains an invalid evidence path.`);
    }
    await access(path.join(root, evidencePath));
  }
}

const missingRows = [...requiredFeatureIds].filter((id) => !seen.has(id));
if (missingRows.length > 0) {
  throw new Error(`Required parity rows are missing: ${missingRows.join(', ')}`);
}

const releaseBlockers = matrix.features
  .filter((feature) => feature.requiredForGodotRelease && feature.godotStatus !== 'parity')
  .map((feature) => `${feature.id}:${feature.godotStatus}`);

if (matrix.godotReleaseAllowed && releaseBlockers.length > 0) {
  throw new Error(
    `Godot release is enabled with unresolved parity blockers: ${releaseBlockers.join(', ')}`,
  );
}

console.log(
  `Feature parity verified: ${matrix.features.length} required capabilities, `
  + `${releaseBlockers.length} Godot release blockers, releaseAllowed=${matrix.godotReleaseAllowed}.`,
);
