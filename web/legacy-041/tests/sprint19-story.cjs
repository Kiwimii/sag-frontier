const assert=require('node:assert/strict');
const Core=require('../sprint15-story-core.js');

assert.equal(Core.VERSION,19);
assert.equal(Object.keys(Core.FACTIONS).length,3);
assert.equal(Core.CHAPTERS.length,5);
assert.equal(Core.MISSIONS.length,15);
assert.equal(Core.LORE.length,10);
assert.equal(Core.EVENTS.length,6);

let story=Core.defaults();
let base={credits:0,pilotXp:0,skills:{},stats:{runs:20,kills:900,bosses:16,discoveries:80,stations:20,asteroids:70,distance:120000}};
let progression={completedContracts:12,commandData:50,totalDataEarned:50};
const faction=Core.chooseFaction(story,base,progression,'mud');
assert.equal(faction.ok,true);
assert.equal(faction.story.faction,'mud');
assert.equal(faction.base.skills.hull,1);
assert.equal(faction.base.credits,180);
assert.equal(faction.story.loreUnlocked.length,3);
assert.equal(Core.chooseFaction(faction.story,faction.base,faction.progression,'oni').ok,false);
story=faction.story;base=faction.base;progression=faction.progression;
story.sagReputation=120;story.kiwimiTrust=100;story.factionReputation=35;
story=Core.unlockLore(story,base,progression);
assert.ok(story.loreUnlocked.length>=9);

for(const mission of Core.MISSIONS){
  const state=Core.campaignStates(story,base,progression).find(item=>item.id===mission.id);
  assert.equal(state.unlocked,true,`${mission.id} should be sequentially unlocked`);
  assert.equal(state.ready,true,`${mission.id} should meet its requirement`);
  const claimed=Core.claimMission(story,base,progression,mission.id);
  assert.equal(claimed.ok,true,`${mission.id} should be claimable`);
  story=claimed.story;base=claimed.base;progression=claimed.progression;
}
assert.equal(story.claimedMissions.length,15);
assert.equal(story.admitted,true);
assert.ok(['elite','mud-envoy','member'].includes(story.ending));
assert.equal(Core.candidateStatus(story).includes('SAG'),true);
assert.ok(story.loreUnlocked.includes('membership'));

const event=Core.resolveEvent(story,base,progression,'drone','return');
assert.equal(event.ok,true);
assert.equal(event.story.totalEvents,1);
assert.ok(event.story.kiwimiTrust>story.kiwimiTrust);
assert.ok(event.progression.commandData>progression.commandData);

const oni=Core.chooseFaction(Core.defaults(),{skills:{},stats:{}},{},'oni');
assert.equal(oni.base.skills.damage,1);
assert.equal(oni.base.pilotXp,80);
const ustur=Core.chooseFaction(Core.defaults(),{skills:{},stats:{}},{commandData:0},'ustur');
assert.equal(ustur.base.skills.cooldown,1);
assert.equal(ustur.progression.commandData,2);

console.log('Sprint 19 story core tests passed');