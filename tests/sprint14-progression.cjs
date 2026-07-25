const assert=require('node:assert/strict');
const base=require('../sprint14-progression-core.js');
const enhance=require('../sprint14-progression-advanced.js');
const core=enhance(base);
assert.equal(core.__advanced14,true);
let meta=core.defaults();
assert.equal(meta.cycleVersion,3);
meta.commandXp=5000;
meta.commandData=5000;
for(const id of ['contractAnalytics','explorationTelemetry','pilotAcademy','salvageProtocol','tradeNetwork','commandRelay']){
  let remaining=5;
  while(core.researchRank(meta,id)<core.RESEARCH[id].max&&remaining--){
    const result=core.purchaseResearch(meta,id);
    if(!result.ok)break;
    meta=result.meta;
  }
}
assert.ok(core.researchCount(meta)>=8);
assert.equal(core.selectDoctrine(meta,'pathfinder').ok,true);
meta=core.selectDoctrine(meta,'pathfinder').meta;
assert.ok(core.contractSlots(meta)>=3);
let save={credits:5000,cores:2,skillPoints:1,pilotXp:5000,pilotRank:12,difficulty:'veteran',sectorProgress:{outer:10,debris:8,crimson:5},stats:{runs:20,kills:1300,bosses:16,creditsEarned:28000,pilotXpEarned:10000,discoveries:190,stations:24,asteroids:110,distance:190000}};
meta.completedContracts=12;
meta.research={...meta.research,contractAnalytics:3,tacticalDoctrine:3,explorationTelemetry:3,pilotAcademy:3,salvageProtocol:3,tradeNetwork:3,coreSynthesis:2,frontierCartography:2};
for(const operation of core.CAMPAIGN){
  const state=core.campaignStates(meta,save).find(item=>item.id===operation.id);
  assert.equal(state.claimable,true);
  const claimed=core.claimCampaign(meta,save,operation.id);
  assert.equal(claimed.ok,true);
  meta=claimed.meta;
  save=claimed.base;
}
assert.equal(meta.campaignClaimed.length,core.CAMPAIGN.length);
const migrated=core.normalizeMeta({version:14,commandData:3});
assert.equal(migrated.cycleVersion,3);
assert.deepEqual(migrated.campaignClaimed,[]);
console.log('sprint14 progression tests passed');
