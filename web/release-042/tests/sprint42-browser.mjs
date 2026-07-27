import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const releaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);

const fixture = `<!doctype html><html><head>
<meta charset="utf-8"><link rel="stylesheet" href="/sprint42-menu.css">
<style>html,body{margin:0;width:100%;height:100%;background:#03070b}iframe{width:100%;height:100%;border:0}</style>
</head><body><iframe id="baseBuild" src="/menu-mid.html"></iframe><script src="/sprint42-menu.js"></script></body></html>`;
const midFixture = '<!doctype html><html><body><iframe id="stableBuild" src="/menu-app.html"></iframe></body></html>';
const appFixture = `<!doctype html><html><head><style>
.hidden,.sag-hidden,.g-hidden{display:none}.command-center,.sag-story-shell,#galiaShell{position:fixed;inset:20px;background:#101a22;color:white}.command-header,.sag-hq-header,.g-head{display:flex;justify-content:space-between}
</style></head><body>
<button id="commandToggle">COMMAND</button><button id="sagStoryToggle">SAG HQ</button><button id="galiaToggle">GALIA OPS</button>
<section id="commandCenter" class="command-center hidden"><header class="command-header"><h1>Command</h1><button id="commandClose">×</button></header></section>
<section id="sagStoryShell" class="sag-story-shell sag-hidden"><header class="sag-hq-header"><h1>SAG HQ</h1><button id="sagStoryClose">×</button></header></section>
<section id="galiaShell" class="g-hidden"><header class="g-head"><h1>Galia</h1><button id="galiaClose">×</button></header></section>
<section id="sagIntro" class="sag-hidden"></section><section id="sagFactionStage" class="sag-hidden"></section><section id="sagEventOverlay" class="sag-hidden"></section><section id="sagStoryScene" class="sag-hidden"></section>
<script>
commandToggle.onclick=()=>commandCenter.classList.remove('hidden');
sagStoryToggle.onclick=()=>sagStoryShell.classList.remove('sag-hidden');
galiaToggle.onclick=()=>galiaShell.classList.remove('g-hidden');
</script></body></html>`;

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const fixtures = new Map([
      ['/menu-fixture.html', fixture],
      ['/menu-mid.html', midFixture],
      ['/menu-app.html', appFixture],
    ]);
    if (fixtures.has(pathname)) {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      response.end(fixtures.get(pathname));
      return;
    }
    const relative = pathname.replace(/^\/+/, '');
    const absolute = path.resolve(releaseRoot, relative);
    if (!absolute.startsWith(`${releaseRoot}${path.sep}`)) return response.writeHead(403).end();
    const details = await stat(absolute);
    if (!details.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'content-type': contentTypes.get(path.extname(absolute)) || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(absolute).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${address.port}/menu-fixture.html`, { waitUntil: 'networkidle' });

  const menuButton = page.locator('.s42-menu-button');
  await menuButton.waitFor({ state: 'visible' });
  assert.equal(await menuButton.count(), 1, 'exactly one central menu trigger must be visible');

  const appFrame = page.frames().find((candidate) => candidate.url().includes('/menu-app.html'));
  assert.ok(appFrame, 'menu fixture must expose the application frame');
  await appFrame.locator('body[data-s42-menu-managed="true"]').waitFor();
  await appFrame.locator('#commandToggle').waitFor({ state: 'hidden' });
  await appFrame.locator('#sagStoryToggle').waitFor({ state: 'hidden' });
  await appFrame.locator('#galiaToggle').waitFor({ state: 'hidden' });

  for (const target of [
    ['command', '#commandCenter:not(.hidden)', '#commandClose', '#commandCenter.hidden'],
    ['sag', '#sagStoryShell:not(.sag-hidden)', '#sagStoryClose', '#sagStoryShell.sag-hidden'],
    ['galia', '#galiaShell:not(.g-hidden)', '#galiaClose', '#galiaShell.g-hidden'],
  ]) {
    const [name, openSelector, closeSelector, closedSelector] = target;
    await menuButton.click();
    await page.locator('.s42-drawer.open').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.s42-close').isVisible(), true, 'central menu requires a visible X close button');
    await page.locator(`[data-open="${name}"]`).click();
    await appFrame.locator(openSelector).waitFor({ state: 'visible' });
    await appFrame.locator(closeSelector).waitFor({ state: 'visible' });
    await appFrame.locator(closeSelector).click();
    await appFrame.locator(closedSelector).waitFor();
  }

  console.log('Sprint 42 unified-menu browser regression passed');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
