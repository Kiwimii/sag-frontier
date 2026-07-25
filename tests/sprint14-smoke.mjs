import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:820}});
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
try{
  await page.goto('http://127.0.0.1:4173/sprint14.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.SAG14Core?.__advanced14));
  const gameFrame=page.frame({url:/sprint13\.html/});
  assert.ok(gameFrame);
  await gameFrame.waitForSelector('#startRunBtn');
  await page.locator('#commandToggle').click();
  await page.locator('#commandCenter:not(.hidden)').waitFor();
  assert.match(await page.locator('#commandContent').innerText(),/Meisterschaften/i);
  await page.locator('[data-command-tab="contracts"]').click();
  assert.ok(await page.locator('#contractOffers .contract-card').count()>=3);
  await page.locator('[data-command-tab="research"]').click();
  assert.equal(await page.locator('#researchGrid .research-card').count(),10);
  assert.equal(await page.locator('#doctrineGrid .doctrine-card').count(),4);
  await page.locator('[data-command-tab="campaign"]').click();
  assert.equal(await page.locator('#campaignLine .campaign-node').count(),9);
  await page.locator('[data-command-tab="records"]').click();
  assert.equal(await page.locator('#achievementGrid .achievement').count(),8);
  const result=await page.evaluate(()=>{
    const core=window.SAG14Core;
    let meta=core.defaults();
    meta.commandXp=5000;meta.commandData=5000;meta.completedContracts=12;
    meta.research={contractAnalytics:3,tacticalDoctrine:3,explorationTelemetry:3,pilotAcademy:3,salvageProtocol:3,tradeNetwork:3,commandRelay:2,coreSynthesis:2,frontierCartography:2};
    const save={credits:5000,cores:2,skillPoints:1,pilotXp:5000,pilotRank:12,difficulty:'veteran',sectorProgress:{outer:10,debris:8,crimson:5},stats:{runs:20,kills:1300,bosses:16,creditsEarned:28000,pilotXpEarned:10000,discoveries:190,stations:24,asteroids:110,distance:190000}};
    return{cycle:core.normalizeMeta(meta).cycleVersion,research:core.researchCount(meta),campaign:core.campaignStates(meta,save).length};
  });
  assert.equal(result.cycle,3);
  assert.ok(result.research>=10);
  assert.equal(result.campaign,9);
  assert.deepEqual(errors,[]);
  console.log('sprint14 browser smoke test passed');
} finally {
  await browser.close();
}
