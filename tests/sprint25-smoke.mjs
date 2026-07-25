import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:820}});
const errors=[];
page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`);});
await page.addInitScript(()=>{
  if(window!==window.top)return;
  localStorage.setItem('sag-frontier-save-v05',JSON.stringify({credits:12345,pilotXp:120,stats:{runs:2,kills:18,bosses:0,discoveries:3,stations:1,asteroids:4,distance:6500}}));
  localStorage.setItem('sag-frontier-progression-v14',JSON.stringify({commandData:8,completedContracts:1,activeContracts:[],contractOffers:[]}));
  localStorage.setItem('sag-frontier-story-v19',JSON.stringify({version:19,introSeen:true,faction:'mud',sagReputation:18,kiwimiTrust:9,factionReputation:10,claimedMissions:[],loreUnlocked:['sag-origin','kiwimi-founder'],dialogueHistory:{},seenScenes:[],eventHistory:[],totalEvents:0,lastEventRun:0,lastDebriefRun:0,reducedMotion:true,admitted:false,ending:null,chapter:1}));
});
try{
  await page.goto('http://127.0.0.1:4173/sprint25.html?build=0250',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.SAG25_NARRATIVE&&window.SAGDialogue&&window.SAGFactionNarrative&&window.SAGDacDossier&&window.SAGNarrativeBible&&window.SAG20_FOCUSED?.installed));
  await page.locator('#sagStoryShell:not(.sag-hidden)').waitFor({timeout:6000});
  await page.locator('.focus-page').waitFor();
  assert.equal(await page.locator('body').getAttribute('data-build'),'0250');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sag-frontier-save-v05')).credits),12345);
  assert.equal(await page.evaluate(()=>localStorage.getItem('sag-frontier-reset-v025')),null);
  assert.equal(await page.evaluate(()=>window.SAGStoryCore.LORE.length),20);
  assert.equal(await page.evaluate(()=>window.SAGStoryCore.EVENTS.length),8);
  assert.equal(await page.evaluate(()=>window.SAGStoryCore.MISSIONS.length),15);

  await page.locator('[data-narrative="kiwimi"]').waitFor();
  await page.locator('[data-narrative="kiwimi"]').click();
  await page.locator('#sagDialogueOverlay:not(.sag-hidden)').waitFor();
  assert.match(await page.locator('#sagDialogueOverlay').innerText(),/Warum drei Fraktionen/i);
  await page.locator('.sag-dialogue-choice').first().click();
  assert.equal(await page.evaluate(()=>window.SAGRecruitment.story.kiwimiTrust),11);
  assert.equal(await page.evaluate(()=>window.SAGRecruitment.story.dialogueHistory['1'].flag),'bridge');
  await page.locator('.sag-dialogue-result button').click();

  await page.locator('[data-sag-tab="campaign"]').click();
  await page.locator('.focus-faction-note').waitFor();
  assert.match(await page.locator('.focus-faction-note').innerText(),/Mara Voss/);
  assert.equal(await page.locator('#focusMission').count(),1);

  await page.locator('[data-sag-tab="lore"]').click();
  await page.locator('.sag-source-legend').waitFor();
  assert.equal(await page.locator('.sag-source-badge').count(),3);
  assert.match(await page.locator('#focusLoreReader').innerText(),/SAG DAC|STAR ATLAS KANON|SAG FRONTIER FIKTION/);

  await page.locator('[data-sag-tab="profile"]').click();
  await page.locator('[data-open-dac]').waitFor();
  await page.locator('[data-open-dac]').click();
  await page.locator('#sagDacOverlay:not(.sag-hidden)').waitFor();
  assert.match(await page.locator('#sagDacOverlay').innerText(),/eigenständige Decentralized Autonomous Corporation/i);
  await page.locator('.sag-dac-nav button').filter({hasText:'MITGLIEDSCHAFT'}).click();
  assert.match(await page.locator('#sagDacOverlay').innerText(),/Community ist offen/i);
  await page.locator('.sag-dac-close').click();

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(180);
  const mobile=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,dialogueExists:Boolean(document.getElementById('sagDialogueOverlay')),dacExists:Boolean(document.getElementById('sagDacOverlay'))}));
  assert.ok(mobile.scrollWidth<=mobile.innerWidth+1);
  assert.equal(mobile.dialogueExists,true);
  assert.equal(mobile.dacExists,true);
  assert.deepEqual(errors,[]);
  console.log('Sprint 25 narrative browser smoke test passed');
} finally {
  await browser.close();
}