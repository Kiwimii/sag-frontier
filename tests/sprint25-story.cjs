const assert=require('node:assert/strict');
const Core=require('../sprint15-story-core.js');
global.window=global;
require('../sprint21-lore-bible.js');

console.log('Checking narrative collection sizes');
assert.equal(Core.CHAPTERS.length,5,'five campaign chapters must remain');
assert.equal(Core.MISSIONS.length,15,'all fifteen mission IDs must remain');
assert.equal(Core.LORE.length,20,'expanded codex must contain twenty entries');
assert.equal(Core.EVENTS.length,8,'narrative event pool must contain eight events');
assert.equal(Core.MISSIONS[0].id,'c1-faction');
assert.equal(Core.MISSIONS.at(-1).id,'c5-admission');
assert.equal(Core.CHAPTERS[0].title,'DIE ORDNUNG VON GALIA');
assert.ok(Core.LORE.some(item=>item.id==='iris-cataclysm'&&item.scope==='STAR ATLAS KANON'),'Iris canon entry missing');
assert.ok(Core.LORE.some(item=>item.id==='sag-origin'&&item.scope==='SAG DAC'),'SAG DAC entry missing');
assert.ok(Core.LORE.some(item=>item.id==='black-signal'&&item.scope==='SAG FRONTIER FIKTION'),'fiction entry missing');
assert.equal(Core.FACTIONS.mud.title,'Manus Ultima Divina');
assert.equal(Core.FACTIONS.oni.title,'Das ONI-Konsortium');
assert.equal(Core.FACTIONS.ustur.title,'Der Ustur-Sektor');

console.log('Checking lore unlock compatibility');
let story=Core.defaults();
let base={credits:0,pilotXp:0,skills:{},stats:{runs:20,kills:900,bosses:16,discoveries:80,stations:20,asteroids:70,distance:120000}};
let progression={completedContracts:12,commandData:50,totalDataEarned:50};
const chosen=Core.chooseFaction(story,base,progression,'mud');
story=chosen.story;base=chosen.base;progression=chosen.progression;
story.sagReputation=120;story.kiwimiTrust=100;story.factionReputation=35;
story=Core.unlockLore(story,base,progression);
assert.ok(story.loreUnlocked.includes('iris-cataclysm'),'Iris lore should unlock after faction registration');
assert.ok(story.loreUnlocked.includes('convergence-war'),'war lore should unlock after faction registration');
assert.ok(story.loreUnlocked.includes('starpath'),'StarPath lore should unlock from a completed contract');
assert.ok(story.loreUnlocked.includes('sag-matrix'),'SAG organization lore should unlock from reputation');
assert.ok(story.loreUnlocked.length>=15,`expected at least 15 unlocked entries, got ${story.loreUnlocked.length}`);

console.log('Checking all fifteen legacy mission requirements');
for(const mission of Core.MISSIONS){
  const state=Core.campaignStates(story,base,progression).find(item=>item.id===mission.id);
  assert.equal(state.ready,true,`${mission.id} should retain its playable requirement`);
  const claimed=Core.claimMission(story,base,progression,mission.id);
  assert.equal(claimed.ok,true,`${mission.id} should remain claimable`);
  story=claimed.story;base=claimed.base;progression=claimed.progression;
}
assert.equal(story.admitted,true,'final mission should grant narrative admission');
assert.equal(story.claimedMissions.length,15);
assert.ok(story.loreUnlocked.includes('membership'));

console.log('Checking new event compatibility');
const event=Core.resolveEvent(story,base,progression,'starpath-relay','repair');
assert.equal(event.ok,true,'StarPath relay event should resolve');
assert.ok(event.story.sagReputation>story.sagReputation);
assert.ok(event.progression.commandData>progression.commandData);
assert.ok(Core.EVENTS.every(item=>item.choices.length===2),'each narrative event needs two clear choices');
console.log('Sprint 25 story continuity tests passed');