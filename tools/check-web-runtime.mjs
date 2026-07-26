import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { access, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const runtimeRoot = path.join(root, 'web', 'legacy-041');
const manifestPath = path.join(runtimeRoot, 'release-manifest.json');
const shouldWriteManifest = process.argv.includes('--write');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    if (entry.isFile() && absolute !== manifestPath) files.push(absolute);
  }
  return files.sort();
}

async function describeFile(absolute) {
  const contents = await readFile(absolute);
  const details = await stat(absolute);
  return {
    path: path.relative(runtimeRoot, absolute).split(path.sep).join('/'),
    bytes: details.size,
    sha256: createHash('sha256').update(contents).digest('hex'),
  };
}

function runNode(args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Node ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

await access(path.join(runtimeRoot, 'index.html'));
const runtimeFiles = await walk(runtimeRoot);
const describedFiles = await Promise.all(runtimeFiles.map(describeFile));

if (shouldWriteManifest) {
  const manifest = {
    release: 'SAG Kiwimi Depth 0.41.1',
    baseSource: 'live@8193477ac5fa4758d04b2550292939d3e2a707e6',
    purpose: 'Content lock for the complete imported browser runtime.',
    files: describedFiles,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(root, manifestPath)} with ${describedFiles.length} protected files.`);
  process.exit(0);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!Array.isArray(manifest.files) || manifest.files.length < 180) {
  throw new Error('The protected 0.41 runtime inventory is incomplete.');
}
const expected = JSON.stringify(manifest.files);
const actual = JSON.stringify(describedFiles);
if (actual !== expected) {
  const expectedByPath = new Map(manifest.files.map((file) => [file.path, file]));
  const actualByPath = new Map(describedFiles.map((file) => [file.path, file]));
  const differences = [...new Set([...expectedByPath.keys(), ...actualByPath.keys()])]
    .sort()
    .filter((filePath) => (
      JSON.stringify(expectedByPath.get(filePath)) !== JSON.stringify(actualByPath.get(filePath))
    ))
    .slice(0, 10)
    .map((filePath) => {
      const expectedFile = expectedByPath.get(filePath);
      const actualFile = actualByPath.get(filePath);
      if (!actualFile) return `missing: ${filePath}`;
      if (!expectedFile) return `untracked by manifest: ${filePath}`;
      return `changed: ${filePath}`;
    });
  throw new Error(
    `The protected browser runtime differs from release-manifest.json (${differences.join(', ')}). `
    + 'Review the content change and regenerate the manifest intentionally.',
  );
}

const syntaxFiles = runtimeFiles.filter((file) => /\.(?:c?js|mjs)$/.test(file));
for (const file of syntaxFiles) {
  await runNode(['--check', file]);
}

const regressionTests = runtimeFiles
  .filter((file) => file.includes(`${path.sep}tests${path.sep}`) && file.endsWith('.cjs'))
  .sort();
for (const test of regressionTests) {
  await runNode([test], runtimeRoot);
}

const protectedFeatures = new Map([
  ['sprint13-source.js', ['outerFrontier', 'tradePost', 'anomaly']],
  ['sprint14-progression-core.js', ['commandData', 'contractOffers', 'research']],
  ['sprint25-finale-editorial.js', ['SAG', 'showFinale', 'SAG25Finale']],
  ['sprint35-campaign.js', ['signal', 'corridor', 'archive', 'claim', 'council']],
  ['sprint35-galia-ui.js', ['Sternenkarte', 'Markt & Logistik', 'SAG HQ Ausbau']],
  ['sprint41-kiwimi-depth.js', ['SAGKiwimiDepth', 'founder', 'KIWIMI-AKTE']],
]);
for (const [relativePath, tokens] of protectedFeatures) {
  const contents = await readFile(path.join(runtimeRoot, relativePath), 'utf8');
  for (const token of tokens) {
    if (!contents.includes(token)) {
      throw new Error(`Protected feature token "${token}" is missing from ${relativePath}.`);
    }
  }
}

const htmlFiles = runtimeFiles.filter((file) => file.endsWith('.html'));
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  const references = [...html.matchAll(/\b(?:src|href)=["']([^"'#]+)["']/gi)]
    .map((match) => match[1].split('?')[0])
    .filter((reference) => reference && !/^(?:https?:|data:|about:|mailto:)/i.test(reference));
  for (const reference of references) {
    await access(path.resolve(path.dirname(htmlFile), reference));
  }
}

console.log(`Protected web runtime verified: ${describedFiles.length} files, ${regressionTests.length} regressions, ${htmlFiles.length} HTML entry points.`);
