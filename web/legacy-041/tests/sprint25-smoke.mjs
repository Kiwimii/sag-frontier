import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:820}});
const errors=[];
page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`);});
await page.addInitScript(()=>{
  if(window!==window.top)return;
  localStorage.setItem('sag-frontier-save-v05',JSON.stringify({credits:24680,pilotXp:160,stats:{runs:2,kills:18,bosses:1,discoveries:3,distance:9000,asteroids:2,stations:0}}));
  localStorage.setItem('sag-frontier-progression-v14',JSON.stringify({commandData:8,completedContracts:1,activeContracts:[],contractOffers:[]}));
  localStorage.setItem('sag-frontier-story-v19',JSON.stringify({version:19,introSeen:true,faction:'mud',sagReputation:18,kiwimiTrust:9,factionReputation:5,claimedMissions:[],loreUnlocked:[],eventHistory:[],seenScenes:[],chapter:1,admitted:false,ending:null,reducedMotion:true,lastEventRun:0,totalEvents:0,lastDebriefRun:0}));
});
try{
  await page.goto('http://127.0.0.1:4173/sprint25.html?build=0250',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.SAG25_NARRATIVE?.installed&&window.SAGDialogue&&window.SAG25Finale));
  await page.locator('#sagStoryShell:not(.sag-hidden)').waitFor({timeout:6000});
  await page.locator('.narrative-page').waitFor();
  assert.equal(await page.locator('body').getAttribute('data-build'),'0250');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sag-frontier-save-v05')).credits),24680);
  assert.equal(await page.evaluate(()=>localStorage.getItem('sag-frontier-reset-v025')),null);
  assert.match(await page.locator('#sagStoryContent').innerText(),/Die Kampagne verbindet bestätigte Star-Atlas-Geschichte/i);
  assert.match(await page.locator('#sagStoryContent').innerText(),/keine offizielle Organisation von Star Atlas oder ATMTA/i);

  const trustBefore=await page.evaluate(()=>window.SAGRecruitment.story.kiwimiTrust);
  await page.locator('[data-kiwimi-dialogue]').first().click();
  await page.locator('#sagDialogue:not(.sag-hidden)').waitFor();
  assert.match(await page.locator('#sagDialogue').innerText(),/Was bedeutet meine Fraktion für SAG/i);
  await page.locator('.sag-dialogue-choices button').first().click();
  assert.match(await page.locator('#sagDialogue').innerText(),/SAG ist keine vierte Fraktion/i);
  const trustAfter=await page.evaluate(()=>window.SAGRecruitment.story.kiwimiTrust);
  assert.equal(trustAfter,trustBefore+1);
  await page.locator('[data-dialogue-back]').click();
  await page.locator('.sag-dialogue-choices button').first().click();
  assert.equal(await page.evaluate(()=>window.SAGRecruitment.story.kiwimiTrust),trustAfter);
  await page.locator('[data-dialogue-close]').click();

  await page.locator('[data-sag-tab="campaign"]').click();
  assert.match(await page.locator('#sagStoryContent').innerText(),/DER FRIEDENSKORRIDOR/i);
  assert.match(await page.locator('#sagStoryContent').innerText(),/Dein Ursprung/i);
  assert.match(await page.locator('#sagStoryContent').innerText(),/Convergence War/i);

  await page.locator('[data-sag-tab="lore"]').click();
  await page.locator('#narrativeLoreList button').filter({hasText:'Drei Fraktionen der Galia Expanse'}).click();
  assert.match(await page.locator('#narrativeLoreReader').innerText(),/STAR ATLAS KANON/i);
  assert.match(await page.locator('#narrativeLoreReader').innerText(),/Council of Peace/i);
  await page.screenshot({path:'sprint25-desktop-lore.png',fullPage:true});

  await page.locator('[data-sag-tab="profile"]').click();
  assert.match(await page.locator('#sagStoryContent').innerText(),/Eigenständige, community-getriebene und multifraktionale DAC/i);
  assert.equal(await page.locator('.focus-requirement').count(),4);
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(150);
  const mobile=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,dialogueDisplay:getComputedStyle(document.getElementById('sagDialogue')).display}));
  assert.ok(mobile.scrollWidth<=mobile.innerWidth+1);
  assert.equal(mobile.dialogueDisplay,'none');
  await page.screenshot({path:'sprint25-mobile-profile.png',fullPage:true});

  await page.locator('#narrativeReplayIntro').click();
  await page.locator('#sagIntro:not(.sag-hidden)').waitFor({timeout:6000});
  await page.locator('.sag-intro-scene.active').waitFor();
  assert.match(await page.locator('.sag-intro-scene').first().innerText(),/DER FRIEDEN IST KEINE LEERE/i);
  assert.deepEqual(errors,[]);
  console.log('sprint25 narrative browser smoke test passed');
} finally {
  await browser.close();
}