const assert=require('node:assert/strict');
global.window=global;
global.SAGStoryCore=require('../sprint15-story-core.js');
require('../sprint21-canon-lore.js');
require('../sprint22-sag-dac.js');
require('../sprint23-campaign-narrative.js');

const Core=global.SAGStoryCore,Content=global.SAG25Content;
assert.equal(Core.LORE.length,20);
assert.equal(Core.MISSIONS.length,15);
assert.equal(Core.CHAPTERS.length,5);
assert.equal(Core.EVENTS.length,8);
assert.deepEqual(Core.MISSIONS.map(item=>item.id),[
  'c1-faction','c1-flight','c1-signal','c2-eliminate','c2-salvage','c2-warden','c3-route','c3-contracts','c3-rift','c4-archive','c4-trust','c4-black','c5-candidate','c5-frontier','c5-admission'
]);
assert.ok(Core.MISSIONS.every(item=>item.brief&&item.debrief));
assert.ok(Core.CHAPTERS.every(item=>item.question));
assert.ok(Core.LORE.every(item=>item.source?.label&&item.source?.kind));
assert.ok(Core.LORE.filter(item=>item.source.kind==='canon').length>=9);
assert.ok(Core.LORE.some(item=>item.id==='iris-cataclysm'&&/sieben/i.test(item.text)));
assert.ok(Core.LORE.some(item=>item.id==='council-peace'&&/2523/.test(item.text)));
assert.ok(Core.LORE.some(item=>item.id==='black-signal'&&item.source.kind==='campaign'));
assert.match(Content.SAG.disclaimer,/keine offizielle Organisation/i);
assert.equal(Content.CAREERS.length,5);
assert.equal(Content.LEVELS.length,4);
assert.equal(Content.CHARTER.length,6);

let story=Core.normalize({faction:'mud',loreUnlocked:[]});
story=Core.unlockLore(story,{stats:{runs:1,discoveries:1,distance:9000,bosses:1}},{completedContracts:1});
for(const id of ['mud-origin','council-peace','iris-cataclysm','convergence-war','starpath','outer-zones','minor-powers'])assert.ok(story.loreUnlocked.includes(id),id);
console.log('sprint25 narrative data tests passed');