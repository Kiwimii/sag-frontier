import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:820}});
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
await page.addInitScript(()=>{
  if(window!==window.top)return;
  localStorage.setItem('sag-frontier-save-v05',JSON.stringify({credits:12345,pilotXp:120,stats:{runs:2,kills:18,discoveries:3,distance:6500}}));
  localStorage.setItem('sag-frontier-progression-v14',JSON.stringify({commandData:8,completedContracts:0,activeContracts:[],contractOffers:[]}));
  localStorage.setItem('sag-frontier-story-v19',JSON.stringify({version:19,introSeen:true,faction:'mud',sagReputation:18,kiwimiTrust:9,factionReputation:{mud:10,oni:0,ustur:0},claimedMissions:[],loreUnlocked:['sag-origin','kiwimi-founder'],storyFlags:{},seenScenes:[],eventHistory:[],totalEvents:0,lastEventRun:0,lastDebriefRun:0,reducedMotion:true,admitted:false,ending:null,chapter:1}));
});
try{
  await page.goto('http://127.0.0.1:4173/sprint20.html?build=0200',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.SAGRecruitment&&window.SAGStoryCore));
  await page.locator('#sagStoryShell:not(.sag-hidden)').waitFor({timeout:5000});
  assert.equal(await page.locator('body').getAttribute('data-build'),'0200');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sag-frontier-save-v05')).credits),12345);
  assert.equal(await page.locator('#commandToggle').evaluate(node=>getComputedStyle(node).display),'none');
  assert.equal(await page.locator('#sagStoryTabs button:visible').count(),4);
  assert.equal(await page.locator('.focus-page').count(),1);
  assert.equal(await page.locator('.sag-hero').count(),0);
  assert.match(await page.locator('#sagStoryContent').innerText(),/Dein nächster Schritt/i);
  await page.locator('#focusCommand').click();
  await page.locator('#commandCenter:not(.hidden)').waitFor();
  await page.locator('#commandClose').click();
  await page.locator('#sagStoryToggle').click();
  await page.locator('[data-sag-tab="campaign"]').click();
  assert.equal(await page.locator('#focusMission').count(),1);
  assert.equal(await page.locator('.sag-mission-node').count(),0);
  assert.equal(await page.locator('.focus-history article').count(),3);
  await page.locator('[data-sag-tab="lore"]').click();
  assert.ok(await page.locator('#focusLoreList button').count()<=3);
  assert.equal(await page.locator('.sag-lore-card').count(),0);
  await page.locator('[data-sag-tab="profile"]').click();
  assert.equal(await page.locator('.focus-requirement').count(),4);
  assert.equal(await page.locator('.sag-profile-grid').count(),0);
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(150);
  const mobile=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,position:getComputedStyle(document.getElementById('sagStoryToggle')).position,bottom:getComputedStyle(document.getElementById('sagStoryToggle')).bottom}));
  assert.ok(mobile.scrollWidth<=mobile.innerWidth+1);
  assert.equal(mobile.position,'fixed');
  assert.notEqual(mobile.bottom,'auto');
  assert.deepEqual(errors,[]);
  console.log('sprint20 focused browser smoke test passed');
} finally {
  await browser.close();
}
