(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.SAG14Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=14;
  const TRACKS=['combat','exploration','salvage'];
  const MASTERY_THRESHOLDS={
    combat:[0,25,75,160,300,500,800,1200,1700,2300,3000],
    exploration:[0,8,20,40,70,110,165,230,310,405,520],
    salvage:[0,6,15,30,52,80,118,160,215,280,360]
  };
  const CONTRACT_TYPES=['kills','discoveries','distance','bosses','stations','asteroids','credits','runs'];
  const DIFFICULTY_MULT={explorer:1,operation:1.18,veteran:1.42};
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function num(value,min=0){value=Number(value);return Number.isFinite(value)?Math.max(min,value):min;}
  function int(value,min=0){return Math.floor(num(value,min));}
  function hash(seed){let h=2166136261;for(const ch of String(seed)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(seed){let state=hash(seed)||1;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
  function defaults(){return{
    version:VERSION,cycleVersion:1,commandData:0,commandXp:0,totalDataEarned:0,lastProcessedRun:0,
    masteryClaimed:{combat:0,exploration:0,salvage:0},contractOffers:[],activeContracts:[],contractHistory:[],
    completedContracts:0,rerolls:0,runLedger:[],research:{},doctrine:'balanced',campaignClaimed:[],achievements:{},
    coreMeter:0,bonusStats:{credits:0,cores:0,skillPoints:0,pilotXp:0,commandData:0}
  };}
  function normalizeMeta(input){
    const d=defaults(),m=input&&typeof input==='object'?clone(input):{};
    const out={...d,...m};
    out.version=VERSION;out.cycleVersion=Math.max(1,int(out.cycleVersion,1));
    for(const key of ['commandData','commandXp','totalDataEarned','lastProcessedRun','completedContracts','rerolls','coreMeter'])out[key]=int(out[key]);
    out.masteryClaimed={...d.masteryClaimed,...(m.masteryClaimed||{})};for(const track of TRACKS)out.masteryClaimed[track]=int(out.masteryClaimed[track]);
    out.contractOffers=Array.isArray(m.contractOffers)?m.contractOffers.filter(Boolean):[];
    out.activeContracts=Array.isArray(m.activeContracts)?m.activeContracts.filter(Boolean):[];
    out.contractHistory=Array.isArray(m.contractHistory)?m.contractHistory.filter(Boolean).slice(-40):[];
    out.runLedger=Array.isArray(m.runLedger)?m.runLedger.filter(Boolean).slice(-30):[];
    out.research={...(m.research||{})};out.campaignClaimed=Array.isArray(m.campaignClaimed)?m.campaignClaimed:[];
    out.achievements={...(m.achievements||{})};out.bonusStats={...d.bonusStats,...(m.bonusStats||{})};
    for(const key of Object.keys(out.bonusStats))out.bonusStats[key]=int(out.bonusStats[key]);
    return out;
  }
  function baseStats(base){const s=base&&base.stats||{};return{
    runs:int(s.runs),kills:int(s.kills),bosses:int(s.bosses),creditsEarned:int(s.creditsEarned),pilotXpEarned:int(s.pilotXpEarned),
    discoveries:int(s.discoveries),stations:int(s.stations),asteroids:int(s.asteroids),distance:int(s.distance)
  };}
  function statDelta(before,after){const a=baseStats(after),b=baseStats(before),out={};for(const key of Object.keys(a))out[key]=Math.max(0,a[key]-b[key]);return out;}
  function commandRankForXp(xp){let rank=1;xp=int(xp);while(rank<50&&xp>=commandRankThreshold(rank+1))rank++;return rank;}
  function commandRankThreshold(rank){const n=Math.max(0,int(rank,1)-1);return Math.round(60*n+28*n*n);}
  function commandRankProgress(xp){const rank=commandRankForXp(xp),start=commandRankThreshold(rank),end=commandRankThreshold(rank+1);return{rank,current:xp-start,needed:end-start,ratio:Math.max(0,Math.min(1,(xp-start)/Math.max(1,end-start)))};}
  function masteryScore(track,base){const s=baseStats(base);if(track==='combat')return s.kills+s.bosses*15;if(track==='exploration')return s.discoveries+Math.floor(s.distance/2500);return Math.floor(s.creditsEarned/500)+s.stations*3+s.asteroids;}
  function masteryLevel(track,base){const score=masteryScore(track,base),list=MASTERY_THRESHOLDS[track];let level=0;for(let i=1;i<list.length;i++)if(score>=list[i])level=i;return level;}
  function masteryState(track,base,meta){const level=masteryLevel(track,base),claimed=int(meta.masteryClaimed[track]),list=MASTERY_THRESHOLDS[track],next=list[Math.min(level+1,list.length-1)];return{track,score:masteryScore(track,base),level,claimed,claimable:Math.max(0,level-claimed),next,max:list.length-1};}
  function masteryReward(track,level){const bias=track==='combat'?{credits:90,cores:level%4===0?1:0}:track==='exploration'?{credits:70,cores:level%5===0?1:0}:{credits:120,cores:level%6===0?1:0};return{commandData:8+level*3,credits:bias.credits+level*25,cores:bias.cores,skillPoints:level%5===0?1:0,pilotXp:20+level*8};}
  function applyReward(meta,base,reward,source){
    const m=normalizeMeta(meta),b=clone(base||{});b.stats={...(b.stats||{})};
    m.commandData+=int(reward.commandData);m.commandXp+=int(reward.commandData);m.totalDataEarned+=int(reward.commandData);
    b.credits=int(b.credits)+int(reward.credits);b.cores=int(b.cores)+int(reward.cores);b.skillPoints=int(b.skillPoints)+int(reward.skillPoints);b.pilotXp=int(b.pilotXp)+int(reward.pilotXp);
    b.stats.creditsEarned=int(b.stats.creditsEarned)+int(reward.credits);b.stats.skillPointsEarned=int(b.stats.skillPointsEarned)+int(reward.skillPoints);b.stats.pilotXpEarned=int(b.stats.pilotXpEarned)+int(reward.pilotXp);
    m.bonusStats.commandData+=int(reward.commandData);m.bonusStats.credits+=int(reward.credits);m.bonusStats.cores+=int(reward.cores);m.bonusStats.skillPoints+=int(reward.skillPoints);m.bonusStats.pilotXp+=int(reward.pilotXp);
    if(source)m.runLedger.push({at:Date.now(),source,reward:clone(reward)});
    return{meta:m,base:b};
  }
  function claimMastery(meta,base,track){
    let m=normalizeMeta(meta),b=clone(base||{});if(!TRACKS.includes(track))return{meta:m,base:b,rewards:[]};
    const state=masteryState(track,b,m),rewards=[];for(let level=state.claimed+1;level<=state.level;level++)rewards.push(masteryReward(track,level));
    for(const reward of rewards){const applied=applyReward(m,b,reward,'mastery:'+track);m=applied.meta;b=applied.base;}
    m.masteryClaimed[track]=state.level;return{meta:m,base:b,rewards};
  }
  function contractSlots(meta){return commandRankForXp(meta.commandXp)>=10?3:commandRankForXp(meta.commandXp)>=5?2:1;}
  function contractTarget(type,rank,r){const scale=1+Math.max(0,rank-1)*.12;switch(type){case'kills':return Math.round((24+r()*16)*scale);case'discoveries':return Math.round((5+r()*5)*scale);case'distance':return Math.round((1400+r()*1200)*scale/100)*100;case'bosses':return rank<4?1:1+Math.floor(r()*2);case'stations':return 1+Math.floor(r()*3);case'asteroids':return 3+Math.floor(r()*5);case'credits':return Math.round((280+r()*320)*scale/10)*10;default:return 1+Math.floor(r()*2);}}
  function contractReward(type,target,rank,difficulty){const weight={kills:1,discoveries:1.2,distance:1.25,bosses:2,stations:1.4,asteroids:1.1,credits:1.15,runs:.9}[type]||1;const diff=DIFFICULTY_MULT[difficulty]||1;const data=Math.round((10+rank*2+Math.sqrt(target)*weight)*diff);return{commandData:data,credits:Math.round((70+rank*25+data*7)*diff),cores:type==='bosses'||data>=32?1:0,skillPoints:data>=42?1:0,pilotXp:Math.round((25+data*3)*diff)};}
  function generateOffers(meta,base,count=3){const m=normalizeMeta(meta),rank=commandRankForXp(m.commandXp),run=baseStats(base).runs,r=rng('offer:'+run+':'+m.rerolls+':'+rank),types=[...CONTRACT_TYPES],offers=[];while(offers.length<count&&types.length){const index=Math.floor(r()*types.length),type=types.splice(index,1)[0],difficulty=rank>=7&&r()>.72?'veteran':rank>=3&&r()>.42?'operation':'explorer',target=contractTarget(type,rank,r),id='C'+(run+1)+'-'+m.rerolls+'-'+offers.length+'-'+type;offers.push({id,type,target,progress:0,difficulty,reward:contractReward(type,target,rank,difficulty),createdRun:run});}return offers;}
  function ensureOffers(meta,base){const m=normalizeMeta(meta);if(m.contractOffers.length<3)m.contractOffers=generateOffers(m,base,3);return m;}
  function activateContract(meta,base,id){const m=ensureOffers(meta,base);if(m.activeContracts.length>=contractSlots(m))return{meta:m,ok:false,reason:'slots'};const index=m.contractOffers.findIndex(c=>c.id===id);if(index<0)return{meta:m,ok:false,reason:'missing'};const contract=m.contractOffers.splice(index,1)[0];m.activeContracts.push(contract);if(m.contractOffers.length<3)m.contractOffers=generateOffers(m,base,3);return{meta:m,ok:true,contract};}
  function rerollContracts(meta,base){const m=normalizeMeta(meta),cost=Math.max(2,8-commandRankForXp(m.commandXp));if(m.commandData<cost)return{meta:m,ok:false,cost};m.commandData-=cost;m.rerolls++;m.contractOffers=generateOffers(m,base,3);return{meta:m,ok:true,cost};}
  function contractProgressValue(contract,delta){return contract.type==='kills'?delta.kills:contract.type==='discoveries'?delta.discoveries:contract.type==='distance'?delta.distance:contract.type==='bosses'?delta.bosses:contract.type==='stations'?delta.stations:contract.type==='asteroids'?delta.asteroids:contract.type==='credits'?delta.creditsEarned:delta.runs;}
  function processRun(meta,beforeBase,afterBase,context={}){
    let m=normalizeMeta(meta),b=clone(afterBase||{});const delta=statDelta(beforeBase,afterBase),run=baseStats(afterBase).runs;
    if(run<=m.lastProcessedRun)return{meta:m,base:b,delta,completed:[],reward:{commandData:0,credits:0,cores:0,skillPoints:0,pilotXp:0},duplicate:true};
    const difficulty=context.difficulty||afterBase.difficulty||'explorer',completed=[];let combined={commandData:0,credits:0,cores:0,skillPoints:0,pilotXp:0};
    for(const contract of m.activeContracts){if((DIFFICULTY_MULT[difficulty]||1)+.001<(DIFFICULTY_MULT[contract.difficulty]||1))continue;contract.progress=int(contract.progress)+contractProgressValue(contract,delta);if(contract.progress>=contract.target){completed.push(contract);for(const key of Object.keys(combined))combined[key]+=int(contract.reward[key]);}}
    if(completed.length){m.activeContracts=m.activeContracts.filter(c=>!completed.some(done=>done.id===c.id));m.completedContracts+=completed.length;m.contractHistory.push(...completed.map(c=>({...c,completedRun:run})));const applied=applyReward(m,b,combined,'contracts');m=applied.meta;b=applied.base;}
    m.commandXp+=5;m.lastProcessedRun=run;m.runLedger.push({at:Date.now(),source:'run',run,delta,completed:completed.map(c=>c.id)});m=ensureOffers(m,b);
    return{meta:m,base:b,delta,completed,reward:combined,duplicate:false};
  }
  function labels(lang='de'){const de={combat:'KAMPFMEISTERSCHAFT',exploration:'ERKUNDUNGSMEISTERSCHAFT',salvage:'BERGUNGSMEISTERSCHAFT',kills:'ABSCHÜSSE',discoveries:'ENTDECKUNGEN',distance:'ROUTENDISTANZ',bosses:'WARDENS',stations:'STATIONEN',asteroids:'ASTEROIDEN',credits:'CREDITS BERGEN',runs:'EINSÄTZE'};const en={combat:'COMBAT MASTERY',exploration:'EXPLORATION MASTERY',salvage:'SALVAGE MASTERY',kills:'KILLS',discoveries:'DISCOVERIES',distance:'ROUTE DISTANCE',bosses:'WARDENS',stations:'STATIONS',asteroids:'ASTEROIDS',credits:'SALVAGE CREDITS',runs:'DEPLOYMENTS'};return lang==='en'?en:de;}
  return{VERSION,TRACKS,MASTERY_THRESHOLDS,defaults,normalizeMeta,baseStats,statDelta,commandRankForXp,commandRankThreshold,commandRankProgress,masteryScore,masteryLevel,masteryState,masteryReward,claimMastery,contractSlots,generateOffers,ensureOffers,activateContract,rerollContracts,processRun,labels,applyReward};
});
