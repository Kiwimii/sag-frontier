(function(root,factory){
  const enhance=factory();
  if(typeof module==='object'&&module.exports)module.exports=enhance;
  if(root&&root.SAG14Core)enhance(root.SAG14Core,root);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const META_KEY='sag-frontier-progression-v14';
  const RESEARCH={
    contractAnalytics:{branch:'operations',max:3,cost:[18,34,58],rank:1,requires:[]},
    missionControl:{branch:'operations',max:1,cost:[70],rank:5,requires:[['contractAnalytics',2]]},
    tacticalDoctrine:{branch:'operations',max:3,cost:[24,42,68],rank:3,requires:[['contractAnalytics',1]]},
    explorationTelemetry:{branch:'science',max:3,cost:[20,38,62],rank:2,requires:[]},
    pilotAcademy:{branch:'science',max:3,cost:[25,45,72],rank:4,requires:[['explorationTelemetry',1]]},
    coreSynthesis:{branch:'science',max:2,cost:[55,92],rank:7,requires:[['pilotAcademy',2]]},
    salvageProtocol:{branch:'logistics',max:3,cost:[20,36,60],rank:2,requires:[]},
    tradeNetwork:{branch:'logistics',max:3,cost:[26,46,74],rank:4,requires:[['salvageProtocol',1]]},
    commandRelay:{branch:'logistics',max:2,cost:[35,64],rank:6,requires:[['tradeNetwork',1]]},
    frontierCartography:{branch:'science',max:2,cost:[44,78],rank:6,requires:[['explorationTelemetry',2]]}
  };
  const DOCTRINES={balanced:{rank:1},assault:{rank:3},pathfinder:{rank:5},logistics:{rank:7}};
  const CAMPAIGN=[
    {id:'firstSignal',reward:{commandData:12,credits:180,cores:0,skillPoints:0,pilotXp:40}},
    {id:'contractProtocol',reward:{commandData:20,credits:260,cores:1,skillPoints:0,pilotXp:70}},
    {id:'surveyLine',reward:{commandData:24,credits:320,cores:0,skillPoints:1,pilotXp:90}},
    {id:'wardenDirective',reward:{commandData:30,credits:420,cores:1,skillPoints:0,pilotXp:120}},
    {id:'researchNetwork',reward:{commandData:36,credits:520,cores:1,skillPoints:1,pilotXp:150}},
    {id:'crimsonClearance',reward:{commandData:44,credits:650,cores:2,skillPoints:0,pilotXp:190}},
    {id:'doctrineTrial',reward:{commandData:52,credits:780,cores:1,skillPoints:1,pilotXp:230}},
    {id:'deepSpaceRelay',reward:{commandData:64,credits:950,cores:2,skillPoints:1,pilotXp:300}},
    {id:'frontierCommand',reward:{commandData:90,credits:1400,cores:3,skillPoints:2,pilotXp:450}}
  ];
  const ACHIEVEMENTS=[
    {id:'firstDeployment',reward:{commandData:8,credits:100,cores:0,skillPoints:0,pilotXp:20}},
    {id:'contractor',reward:{commandData:18,credits:220,cores:1,skillPoints:0,pilotXp:50}},
    {id:'hunter',reward:{commandData:22,credits:300,cores:0,skillPoints:0,pilotXp:70}},
    {id:'cartographer',reward:{commandData:24,credits:280,cores:1,skillPoints:0,pilotXp:80}},
    {id:'scientist',reward:{commandData:28,credits:360,cores:1,skillPoints:1,pilotXp:100}},
    {id:'commander',reward:{commandData:40,credits:600,cores:2,skillPoints:1,pilotXp:160}},
    {id:'tripleMastery',reward:{commandData:55,credits:800,cores:2,skillPoints:2,pilotXp:220}},
    {id:'veteranWarden',reward:{commandData:35,credits:500,cores:2,skillPoints:0,pilotXp:140}}
  ];
  const DIFFICULTY_MULT={explorer:1,operation:1.18,veteran:1.42};
  const clone=value=>JSON.parse(JSON.stringify(value));
  const int=(value,min=0)=>Math.max(min,Math.floor(Number(value)||0));
  return function enhance(Core,root){
    if(!Core||Core.__advanced14)return Core;
    const legacy={
      defaults:Core.defaults,normalizeMeta:Core.normalizeMeta,claimMastery:Core.claimMastery,
      ensureOffers:Core.ensureOffers,activateContract:Core.activateContract,rerollContracts:Core.rerollContracts,
      applyReward:Core.applyReward,contractSlots:Core.contractSlots,processRun:Core.processRun
    };
    function advancedDefaults(){return{...legacy.defaults(),cycleVersion:3,research:{},doctrine:'balanced',campaignClaimed:[],achievements:{},campaignInfluence:0,completionStreak:0,bestCompletionStreak:0,coreMeter:0};}
    function normalize(input){const m=legacy.normalizeMeta(input||advancedDefaults());m.cycleVersion=3;m.research={...(m.research||{})};for(const [id,node] of Object.entries(RESEARCH))m.research[id]=Math.min(node.max,int(m.research[id]));m.campaignClaimed=Array.isArray(m.campaignClaimed)?[...new Set(m.campaignClaimed.filter(id=>CAMPAIGN.some(n=>n.id===id)))]:[];m.achievements={...(m.achievements||{})};for(const key of ['campaignInfluence','completionStreak','bestCompletionStreak','coreMeter'])m[key]=int(m[key]);if(!DOCTRINES[m.doctrine]||Core.commandRankForXp(m.commandXp)<DOCTRINES[m.doctrine].rank)m.doctrine='balanced';return m;}
    function stored(){if(!root||!root.localStorage)return null;try{return JSON.parse(root.localStorage.getItem(META_KEY)||'null')}catch{return null}}
    function canonical(input){const local=stored(),merged={...(local||{}),...(input||{})};if(local){for(const key of ['research','doctrine','campaignClaimed','achievements','campaignInfluence','completionStreak','bestCompletionStreak','coreMeter'])if(local[key]!==undefined)merged[key]=clone(local[key]);}return normalize(merged);}
    function researchRank(meta,id){return int(meta&&meta.research&&meta.research[id]);}
    function researchCost(meta,id){const node=RESEARCH[id],rank=researchRank(meta,id);return node&&rank<node.max?node.cost[rank]:0;}
    function researchRequirementsMet(meta,id){const node=RESEARCH[id];return Boolean(node&&Core.commandRankForXp(meta.commandXp)>=node.rank&&node.requires.every(([req,rank])=>researchRank(meta,req)>=rank));}
    function purchaseResearch(meta,id){const m=canonical(meta),node=RESEARCH[id],rank=researchRank(m,id),cost=researchCost(m,id);if(!node||rank>=node.max)return{meta:m,ok:false,reason:'max'};if(!researchRequirementsMet(m,id))return{meta:m,ok:false,reason:'locked'};if(m.commandData<cost)return{meta:m,ok:false,reason:'data',cost};m.commandData-=cost;m.research[id]=rank+1;return{meta:m,ok:true,cost,rank:rank+1};}
    function doctrineAvailable(meta,id){return Boolean(DOCTRINES[id]&&Core.commandRankForXp(meta.commandXp)>=DOCTRINES[id].rank);}
    function selectDoctrine(meta,id){const m=canonical(meta);if(!doctrineAvailable(m,id))return{meta:m,ok:false};m.doctrine=id;return{meta:m,ok:true};}
    function applyReward(meta,base,reward,source){const result=legacy.applyReward(canonical(meta),base,reward,source);result.meta=normalize(result.meta);return result;}
    function claimMastery(meta,base,track){let result=legacy.claimMastery(canonical(meta),base,track);result.meta=normalize(result.meta);const rank=researchRank(result.meta,'frontierCartography'),earned=(result.rewards||[]).reduce((sum,reward)=>sum+int(reward.commandData),0),extra=Math.round(earned*rank*.08);if(extra){const bonus=applyReward(result.meta,result.base,{commandData:extra,credits:0,cores:0,skillPoints:0,pilotXp:0},'cartography-mastery');result={...result,meta:bonus.meta,base:bonus.base,cartographyBonus:extra};}return result;}
    function contractSlots(meta){const m=canonical(meta),rank=Core.commandRankForXp(m.commandXp),base=rank>=10?3:rank>=5?2:1;return Math.min(4,base+(researchRank(m,'missionControl')?1:0));}
    function offerCount(meta){return 3+(researchRank(canonical(meta),'missionControl')?1:0);}
    function ensureOffers(meta,base){const m=canonical(meta),count=offerCount(m);if(m.contractOffers.length<count)m.contractOffers=Core.generateOffers(m,base,count);return m;}
    function activateContract(meta,base,id){const m=ensureOffers(meta,base);if(m.activeContracts.length>=contractSlots(m))return{meta:m,ok:false,reason:'slots'};const index=m.contractOffers.findIndex(c=>c.id===id);if(index<0)return{meta:m,ok:false,reason:'missing'};const contract=m.contractOffers.splice(index,1)[0];m.activeContracts.push(contract);if(m.contractOffers.length<offerCount(m))m.contractOffers=Core.generateOffers(m,base,offerCount(m));return{meta:m,ok:true,contract};}
    function rerollCost(meta){const m=canonical(meta);return Math.max(1,8-Core.commandRankForXp(m.commandXp)-researchRank(m,'commandRelay')*2);}
    function rerollContracts(meta,base){const m=canonical(meta),cost=rerollCost(m);if(m.commandData<cost)return{meta:m,ok:false,cost};m.commandData-=cost;m.rerolls++;m.contractOffers=Core.generateOffers(m,base,offerCount(m));return{meta:m,ok:true,cost};}
    function researchCount(meta){return Object.keys(RESEARCH).reduce((sum,id)=>sum+researchRank(meta,id),0);}
    function campaignRequirement(index,meta,base){const s=Core.baseStats(base),masteries=Core.TRACKS.map(track=>Core.masteryLevel(track,base)),rank=Core.commandRankForXp(meta.commandXp);switch(index){case 0:return s.runs>=1;case 1:return meta.completedContracts>=2;case 2:return Core.masteryLevel('exploration',base)>=2;case 3:return s.bosses>=1;case 4:return researchCount(meta)>=3;case 5:return int(base.pilotRank)>=6||int(base.sectorProgress&&base.sectorProgress.crimson)>0;case 6:return meta.doctrine!=='balanced'&&meta.completedContracts>=5;case 7:return s.distance>=100000&&s.discoveries>=50;case 8:return rank>=10&&meta.completedContracts>=12&&masteries.every(level=>level>=5);default:return false;}}
    function campaignStates(meta,base){const m=canonical(meta);return CAMPAIGN.map((node,index)=>{const claimed=m.campaignClaimed.includes(node.id),previous=index===0||m.campaignClaimed.includes(CAMPAIGN[index-1].id),requirement=campaignRequirement(index,m,base);return{...node,index,claimed,unlocked:previous,claimable:previous&&requirement&&!claimed,requirementMet:requirement};});}
    function claimCampaign(meta,base,id){let m=canonical(meta),b=clone(base||{});const state=campaignStates(m,b).find(item=>item.id===id);if(!state||!state.claimable)return{meta:m,base:b,ok:false};const applied=applyReward(m,b,state.reward,'campaign:'+id);m=applied.meta;b=applied.base;m.campaignClaimed.push(id);m.campaignInfluence+=10+state.index*4;return{meta:m,base:b,ok:true,state};}
    function achievementCondition(id,meta,base,context={}){const s=Core.baseStats(base),masteries=Core.TRACKS.map(track=>Core.masteryLevel(track,base));if(id==='firstDeployment')return s.runs>=1;if(id==='contractor')return meta.completedContracts>=5;if(id==='hunter')return s.kills>=500;if(id==='cartographer')return s.discoveries>=100;if(id==='scientist')return researchCount(meta)>=5;if(id==='commander')return Core.commandRankForXp(meta.commandXp)>=10;if(id==='tripleMastery')return masteries.every(level=>level>=5);if(id==='veteranWarden')return context.difficulty==='veteran'&&int(context.delta&&context.delta.bosses)>0;return false;}
    function checkAchievements(meta,base,context={}){let m=canonical(meta),b=clone(base||{}),unlocked=[];for(const achievement of ACHIEVEMENTS){if(m.achievements[achievement.id]||!achievementCondition(achievement.id,m,b,context))continue;const applied=applyReward(m,b,achievement.reward,'achievement:'+achievement.id);m=applied.meta;b=applied.base;m.achievements[achievement.id]=Date.now();unlocked.push(achievement);}return{meta:m,base:b,unlocked};}
    function campaignBonus(meta){const count=(meta.campaignClaimed||[]).length;return{contractData:1+Math.floor(count/3)*.05,credits:count*.01,pilotXp:count*.01,coreThreshold:count>=8?1:0};}
    function progressValue(contract,delta){return contract.type==='kills'?delta.kills:contract.type==='discoveries'?delta.discoveries:contract.type==='distance'?delta.distance:contract.type==='bosses'?delta.bosses:contract.type==='stations'?delta.stations:contract.type==='asteroids'?delta.asteroids:contract.type==='credits'?delta.creditsEarned:delta.runs;}
    function progressMultiplier(meta,type){let value=1;if(type==='kills'||type==='bosses')value+=researchRank(meta,'tacticalDoctrine')*.08+(meta.doctrine==='assault'?.22:0);if(type==='discoveries'||type==='distance'||type==='stations')value+=researchRank(meta,'explorationTelemetry')*.08+(meta.doctrine==='pathfinder'?.22:0);if(type==='credits'||type==='asteroids')value+=meta.doctrine==='logistics'?.18:0;return value;}
    function specializedReward(meta,contract){const reward=clone(contract.reward),type=contract.type;let dataMul=1+researchRank(meta,'contractAnalytics')*.06,creditMul=1+researchRank(meta,'tradeNetwork')*.08;if(meta.doctrine==='assault'&&(type==='kills'||type==='bosses'))dataMul+=.2;if(meta.doctrine==='pathfinder'&&(type==='discoveries'||type==='distance'||type==='stations'))dataMul+=.2;if(meta.doctrine==='logistics'&&(type==='credits'||type==='asteroids')){dataMul+=.16;creditMul+=.12;}reward.commandData=Math.round(reward.commandData*dataMul*campaignBonus(meta).contractData);reward.credits=Math.round(reward.credits*creditMul);return reward;}
    function processRun(meta,beforeBase,afterBase,context={}){let m=canonical(meta),b=clone(afterBase||{});const delta=Core.statDelta(beforeBase,afterBase),run=Core.baseStats(afterBase).runs;if(run<=m.lastProcessedRun)return{meta:m,base:b,delta,completed:[],reward:{commandData:0,credits:0,cores:0,skillPoints:0,pilotXp:0},runBonus:{credits:0,cores:0,pilotXp:0},achievements:[],duplicate:true};const difficulty=context.difficulty||afterBase.difficulty||'explorer',completed=[];let reward={commandData:0,credits:0,cores:0,skillPoints:0,pilotXp:0};for(const contract of m.activeContracts){if((DIFFICULTY_MULT[difficulty]||1)+.001<(DIFFICULTY_MULT[contract.difficulty]||1))continue;contract.progress=int(contract.progress)+Math.max(0,Math.round(progressValue(contract,delta)*progressMultiplier(m,contract.type)));if(contract.progress>=contract.target){completed.push(contract);const specialized=specializedReward(m,contract);contract.finalReward=specialized;for(const key of Object.keys(reward))reward[key]+=int(specialized[key]);}}if(completed.length){m.activeContracts=m.activeContracts.filter(c=>!completed.some(done=>done.id===c.id));m.completedContracts+=completed.length;m.contractHistory.push(...completed.map(c=>({...c,completedRun:run})));const applied=applyReward(m,b,reward,'contracts');m=applied.meta;b=applied.base;}const campaign=campaignBonus(m),runBonus={credits:Math.round(delta.creditsEarned*(researchRank(m,'salvageProtocol')*.05+campaign.credits)),pilotXp:Math.round(delta.pilotXpEarned*(researchRank(m,'pilotAcademy')*.06+campaign.pilotXp)),cores:0};if(researchRank(m,'coreSynthesis')){m.coreMeter+=1+completed.length;const threshold=Math.max(2,(researchRank(m,'coreSynthesis')>=2?3:5)-campaign.coreThreshold);while(m.coreMeter>=threshold){m.coreMeter-=threshold;runBonus.cores++;}}if(runBonus.credits||runBonus.pilotXp||runBonus.cores){const applied=applyReward(m,b,{commandData:0,credits:runBonus.credits,cores:runBonus.cores,skillPoints:0,pilotXp:runBonus.pilotXp},'research-run-bonus');m=applied.meta;b=applied.base;}m.completionStreak=completed.length?m.completionStreak+1:0;m.bestCompletionStreak=Math.max(m.bestCompletionStreak,m.completionStreak);if(m.completionStreak>1){const streak=applyReward(m,b,{commandData:Math.min(10,m.completionStreak*2),credits:0,cores:0,skillPoints:0,pilotXp:0},'completion-streak');m=streak.meta;b=streak.base;}m.commandXp+=5+researchRank(m,'commandRelay');m.lastProcessedRun=run;const achieved=checkAchievements(m,b,{difficulty,delta});m=achieved.meta;b=achieved.base;m.runLedger.push({at:Date.now(),source:'run',run,delta,completed:completed.map(c=>c.id),runBonus,achievements:achieved.unlocked.map(a=>a.id)});m=ensureOffers(m,b);return{meta:m,base:b,delta,completed,reward,runBonus,achievements:achieved.unlocked,duplicate:false};}
    Object.assign(Core,{RESEARCH,DOCTRINES,CAMPAIGN,ACHIEVEMENTS,__advanced14:true,defaults:advancedDefaults,normalizeMeta:normalize,researchRank,researchCost,researchRequirementsMet,purchaseResearch,doctrineAvailable,selectDoctrine,researchCount,campaignStates,claimCampaign,checkAchievements,campaignBonus,claimMastery,contractSlots,offerCount,ensureOffers,activateContract,rerollCost,rerollContracts,processRun,applyReward});
    return Core;
  };
});
