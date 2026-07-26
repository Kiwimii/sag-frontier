import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:820}});
const errors=[];
page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`);});
await page.addInitScript(()=>{
  if(window!==window.top)return;
  localStorage.setItem('sag-frontier-save-v05',JSON.stringify({credits:99999,pilotXp:99999,stats:{runs:99}}));
  localStorage.setItem('sag-frontier-progression-v14',JSON.stringify({commandData:99999,completedContracts:99}));
  localStorage.setItem('sag-frontier-story-v19',JSON.stringify({faction:'oni',sagReputation:999,kiwimiTrust:999}));
  localStorage.removeItem('sag-frontier-reset-v019');
});
try{
  await page.goto('http://127.0.0.1:4173/sprint19.html?build=0190',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.SAGRecruitment&&window.SAGStoryCore&&window.SAGRecruitment.showWorldEvent));
  assert.equal(await page.locator('body').getAttribute('data-build'),'0190');
  assert.equal(await page.evaluate(()=>localStorage.getItem('sag-frontier-reset-v019')),'1');
  assert.notEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sag-frontier-save-v05')||'{}').credits),99999);
  assert.equal(await page.locator('.sag-intro-scene').count(),5);
  await page.locator('#sagIntro:not(.sag-hidden)').waitFor();
  await page.locator('#sagIntroSkip').click();
  await page.locator('#sagFactionStage:not(.sag-hidden)').waitFor();
  assert.equal(await page.locator('.sag-faction-card').count(),3);
  await page.locator('.sag-faction-card').filter({hasText:'USTUR'}).click();
  await page.locator('#sagStoryShell:not(.sag-hidden)').waitFor();
  assert.equal(await page.evaluate(()=>window.SAGRecruitment.story.faction),'ustur');
  assert.equal(await page.locator('body').evaluate(node=>node.classList.contains('faction-ustur')),true);
  assert.match(await page.locator('#sagStoryContent').innerText(),/VERDIENE DIR DEINEN PLATZ/i);

  await page.locator('[data-sag-tab="campaign"]').click();
  assert.equal(await page.locator('.sag-chapter-button').count(),5);
  assert.equal(await page.locator('.sag-mission-node').count(),3);
  await page.locator('[data-sag-tab="lore"]').click();
  assert.equal(await page.locator('.sag-lore-card').count(),10);
  await page.locator('[data-sag-tab="profile"]').click();
  assert.equal(await page.locator('.sag-requirement').count(),4);
  assert.match(await page.locator('#sagStoryContent').innerText(),/STAR ATLAS GERMANY/i);

  await page.evaluate(()=>{window.SAGRecruitment.closeHQ();window.SAGRecruitment.showWorldEvent();});
  await page.locator('#sagEventOverlay:not(.sag-hidden)').waitFor();
  assert.equal(await page.locator('.sag-event-choice').count(),2);
  await page.locator('.sag-event-choice').first().click();
  await page.locator('.sag-event-result .sag-btn').click();
  assert.equal(await page.evaluate(()=>window.SAGRecruitment.story.totalEvents),1);

  const finalState=await page.evaluate(()=>{
    const App=window.SAGRecruitment,Core=window.SAGStoryCore;
    let story={...App.story,sagReputation:140,kiwimiTrust:110,factionReputation:40,loreUnlocked:Core.LORE.map(item=>item.id)};
    let base={...App.getBase(),credits:5000,cores:10,skillPoints:4,pilotXp:5000,stats:{runs:30,kills:1200,bosses:20,discoveries:100,stations:30,asteroids:100,distance:180000}};
    let progression={...App.getProgression(),completedContracts:15,commandData:100,totalDataEarned:100};
    for(const mission of Core.MISSIONS){const result=Core.claimMission(story,base,progression,mission.id);if(!result.ok)throw new Error(`Mission failed: ${mission.id}`);story=result.story;base=result.base;progression=result.progression;}
    App.saveContext(story,base,progression);App.onAdmission(story);return story;
  });
  assert.equal(finalState.admitted,true);
  await page.locator('.sag-finale:not(.sag-hidden)').waitFor();
  assert.match(await page.locator('.sag-finale-panel').innerText(),/AUFNAHME BESTÄTIGT/i);
  await page.locator('#sagAcceptMembership').click();
  await page.locator('[data-sag-tab="admission"].active').waitFor();
  assert.match(await page.locator('#sagStoryContent').innerText(),/MITGLIEDSSTATUS BESTÄTIGT/i);

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(250);
  const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-window.innerWidth,tabs:getComputedStyle(document.querySelector('.sag-tabs')).position,buttonWidth:document.querySelector('.sag-btn')?.getBoundingClientRect().width||0}));
  assert.ok(mobile.overflow<=2,`Mobile horizontal overflow: ${mobile.overflow}`);
  assert.equal(mobile.tabs,'fixed');
  assert.ok(mobile.buttonWidth>=44);
  assert.deepEqual(errors,[]);
  console.log('Sprint 19 cinematic recruitment browser smoke passed',mobile,finalState.ending);
} finally {
  await browser.close();
}