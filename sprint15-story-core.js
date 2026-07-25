(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.SAGStoryCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=19;
  const FACTIONS={
    mud:{id:'mud',name:'MUD',title:'Die Standhaften',accent:'#f28b35',description:'Industrie, Disziplin und unerschütterliche Hüllenstärke.',bonus:'Verstärkte Hülle · +1 Hüllen-Skill · 180 Start-Credits'},
    oni:{id:'oni',name:'ONI',title:'Die Präzisen',accent:'#ef5968',description:'Geschwindigkeit, taktische Klarheit und kontrollierte Feuerkraft.',bonus:'Gefechtsinstinkt · +1 Schadens-Skill · +80 Piloten-EP'},
    ustur:{id:'ustur',name:'USTUR',title:'Die Erwachten',accent:'#64e5db',description:'Sensorik, Systemverständnis und technologische Anpassung.',bonus:'Systemanalyse · +1 Cooldown-Skill · +2 Command Data'}
  };
  const LORE=[
    {id:'kiwimi-founder',title:'Kiwimi, Gründer von SAG',tag:'PERSON',text:'Kiwimi gründete Star Atlas Germany als unabhängige Gemeinschaft für deutschsprachige Piloten, Strategen, Baumeister und Entdecker. Für ihn ist SAG kein Abzeichen, sondern ein Versprechen: Wissen teilen, gemeinsam wachsen und die Frontier nicht einzelnen Machtblöcken überlassen.'},
    {id:'sag-origin',title:'Die Gründung von SAG',tag:'SAG',text:'SAG entstand aus der Überzeugung, dass Herkunft weniger zählt als Verlässlichkeit. Mitglieder der drei Fraktionen arbeiten zusammen, solange sie Verantwortung übernehmen und ihren Beitrag zum gemeinsamen Auftrag leisten.'},
    {id:'three-factions',title:'Drei Fraktionen, eine Crew',tag:'FAKTIONEN',text:'MUD bringt industrielle Stärke, ONI taktische Präzision und Ustur technologische Tiefe. SAG verlangt nicht, die Herkunft abzulegen. SAG verlangt, sie in den Dienst eines größeren Ziels zu stellen.'},
    {id:'frontier-signal',title:'Das erste Frontier-Signal',tag:'ENTDECKUNG',text:'Ein gestörtes Signal tauchte gleichzeitig in mehreren Sektoren auf. Es trägt keine bekannte Fraktionssignatur, reagiert jedoch auf SAG-Kommunikationsmuster.'},
    {id:'warden-protocol',title:'Warden-Protokoll',tag:'GEFAHR',text:'Wardens bewachen nicht nur Territorium. Ihre Bewegungen folgen einem Muster, das auf eine koordinierte Quelle jenseits der bekannten Routen schließen lässt.'},
    {id:'command-network',title:'SAG Command Network',tag:'SYSTEM',text:'Das Command Network verbindet Expeditionen, Verträge, Forschung und Einsatzdaten. Jeder Run wird Teil eines gemeinsamen Lagebilds und beeinflusst, welche Anwärter Kiwimi persönlich beobachtet.'},
    {id:'anomaly-theory',title:'Theorie der wandernden Risse',tag:'ANOMALIE',text:'Die Risse sind möglicherweise keine Orte, sondern Übergänge. Ustur-Analysen deuten darauf hin, dass sie auf Entscheidungen, Signale und Energieprofile reagieren.'},
    {id:'founding-charter',title:'Die SAG-Charta',tag:'ARCHIV',text:'Die Gründungscharta definiert drei Pflichten: Wissen sichern, Verbündete schützen und Macht niemals mit Kompetenz verwechseln. Kiwimi nutzt diese Grundsätze noch heute bei jeder Aufnahmeentscheidung.'},
    {id:'black-signal',title:'Das schwarze Signal',tag:'GEHEIM',text:'Hinter den Warden-Signaturen liegt ein zweites Signal. Es ist älter, leiser und scheint jeden Piloten zu katalogisieren, der tief genug in die Frontier vordringt.'},
    {id:'membership',title:'Aufnahme in Star Atlas Germany',tag:'SAG',text:'Eine SAG-Mitgliedschaft ist der Abschluss der Anwärterkampagne und zugleich der Anfang. Aufgenommene Piloten erhalten Zugang zur gemeinsamen Expeditionsidentität und tragen Verantwortung für die nächsten Rekruten.'}
  ];
  const MISSIONS=[
    {id:'c1-faction',chapter:1,title:'Herkunft bekennen',text:'Wähle MUD, ONI oder Ustur als deine Herkunft.',metric:'faction',target:1,reward:{sagReputation:5,kiwimiTrust:4,commandData:2}},
    {id:'c1-flight',chapter:1,title:'Erster Flug',text:'Schließe deinen ersten Einsatz ab.',metric:'runs',target:1,reward:{sagReputation:6,kiwimiTrust:3,credits:180}},
    {id:'c1-signal',chapter:1,title:'Der Ruf aus der Leere',text:'Finde zwei Entdeckungen oder fliege mindestens 1.500 Distanz.',metric:'signal',target:2,reward:{sagReputation:7,kiwimiTrust:4,pilotXp:90}},
    {id:'c2-eliminate',chapter:2,title:'Bewährungsfeuer',text:'Erreiche 60 Abschüsse.',metric:'kills',target:60,reward:{sagReputation:8,kiwimiTrust:4,credits:260}},
    {id:'c2-salvage',chapter:2,title:'Was andere zurücklassen',text:'Untersuche sechs Asteroiden oder zwei Stationen.',metric:'salvage',target:6,reward:{sagReputation:7,kiwimiTrust:5,cores:1}},
    {id:'c2-warden',chapter:2,title:'Warden-Protokoll',text:'Besiege einen Warden.',metric:'bosses',target:1,reward:{sagReputation:10,kiwimiTrust:7,commandData:3}},
    {id:'c3-route',chapter:3,title:'Jenseits der sicheren Route',text:'Erreiche insgesamt 8.000 Distanz.',metric:'distance',target:8000,reward:{sagReputation:8,kiwimiTrust:5,credits:320}},
    {id:'c3-contracts',chapter:3,title:'Verlässlichkeit',text:'Schließe zwei Command-Verträge ab.',metric:'contracts',target:2,reward:{sagReputation:9,kiwimiTrust:7,commandData:4}},
    {id:'c3-rift',chapter:3,title:'Fragmente des Risses',text:'Sammle 18 Entdeckungen.',metric:'discoveries',target:18,reward:{sagReputation:10,kiwimiTrust:6,cores:1}},
    {id:'c4-archive',chapter:4,title:'Die Gründungschronik',text:'Schalte sechs Lore-Einträge frei.',metric:'lore',target:6,reward:{sagReputation:8,kiwimiTrust:10,commandData:5}},
    {id:'c4-trust',chapter:4,title:'Kiwimis Vertrauen',text:'Erreiche 45 SAG-Ruf und 35 Vertrauen.',metric:'trustGate',target:1,reward:{sagReputation:10,kiwimiTrust:8,skillPoints:1}},
    {id:'c4-black',chapter:4,title:'Das schwarze Signal',text:'Besiege fünf Wardens und fliege 30.000 Distanz.',metric:'blackSignal',target:1,reward:{sagReputation:12,kiwimiTrust:9,cores:2}},
    {id:'c5-candidate',chapter:5,title:'Kandidatenstatus',text:'Erreiche 70 SAG-Ruf und 55 Vertrauen.',metric:'candidate',target:1,reward:{sagReputation:8,kiwimiTrust:6,commandData:6}},
    {id:'c5-frontier',chapter:5,title:'Grenzfeuer',text:'Erreiche 450 Abschüsse, acht Wardens und zwölf Einsätze.',metric:'finalTrial',target:1,reward:{sagReputation:14,kiwimiTrust:10,credits:900,cores:2}},
    {id:'c5-admission',chapter:5,title:'Aufnahmeprüfung',text:'Schließe alle vorherigen Kampagnenmissionen ab.',metric:'admission',target:1,reward:{sagReputation:20,kiwimiTrust:15,skillPoints:2,commandData:10}}
  ];
  const CHAPTERS=[
    {id:1,title:'DER RUF',subtitle:'Kiwimi öffnet den Rekrutierungskanal.',scene:'Die Frontier sendet ein Signal. SAG antwortet.'},
    {id:2,title:'DIE PRÜFUNG',subtitle:'Leistung zählt erst, wenn sie unter Druck besteht.',scene:'Kiwimi beobachtet nicht nur Siege. Er beobachtet Entscheidungen.'},
    {id:3,title:'DIE SPUR',subtitle:'Die Anomalien folgen einem unbekannten Muster.',scene:'Jede Route führt tiefer in ein System, das bereits zurückblickt.'},
    {id:4,title:'DIE WAHRHEIT',subtitle:'Warum SAG gegründet wurde.',scene:'Die Charta war nie nur ein Leitbild. Sie war eine Vorbereitung.'},
    {id:5,title:'DIE AUFNAHME',subtitle:'Verdiene dir deinen Platz in SAG.',scene:'Der letzte Test entscheidet nicht, ob du stark bist, sondern ob man dir folgen kann.'}
  ];
  const EVENTS=[
    {id:'distress',title:'ZERBROCHENER NOTRUF',text:'Ein ziviles Signal liegt außerhalb der sicheren Route.',choices:[{id:'rescue',label:'RETTUNG EINLEITEN',result:'Du bringst die Besatzung in den SAG-Korridor.',reward:{sagReputation:4,kiwimiTrust:5,credits:90}},{id:'salvage',label:'WRACK BERGEN',result:'Du sicherst Material, lässt das Signal jedoch zurück.',reward:{credits:240,kiwimiTrust:-2}}]},
    {id:'drone',title:'VERLORENE SAG-DROHNE',text:'Eine beschädigte Aufklärungsdrohne sendet Kiwimis alte Signatur.',choices:[{id:'return',label:'AN SAG ZURÜCKSENDEN',result:'Kiwimi bestätigt den Eingang persönlich.',reward:{sagReputation:3,kiwimiTrust:5,commandData:2}},{id:'analyze',label:'KERN ANALYSIEREN',result:'Du entschlüsselst ein Fragment des Command Networks.',reward:{cores:1,commandData:1,lore:'command-network'}}]},
    {id:'patrol',title:'FRAKTIONSPATROUILLE',text:'Eine Patrouille fordert eine eindeutige Identifikation.',choices:[{id:'origin',label:'HERKUNFT ZEIGEN',result:'Deine Fraktion erkennt deine Loyalität an.',reward:{factionReputation:5,credits:100}},{id:'sag',label:'UNTER SAG-SIGNAL FLIEGEN',result:'Du erklärst deine Zugehörigkeit zu einer größeren Mission.',reward:{sagReputation:5,kiwimiTrust:3}}]},
    {id:'shard',title:'ANOMALIE-FRAGMENT',text:'Ein schwarzer Splitter reagiert auf deinen Scanner.',choices:[{id:'scan',label:'TIEFENSCAN',result:'Das Fragment schreibt eine neue Frequenz in dein Archiv.',reward:{sagReputation:3,commandData:2,lore:'anomaly-theory'}},{id:'destroy',label:'ZERSTÖREN',result:'Du eliminierst ein unkalkulierbares Risiko.',reward:{kiwimiTrust:4,credits:120}}]},
    {id:'convoy',title:'GRENZKONVOI',text:'Ein Konvoi bittet um Begleitschutz durch einen instabilen Korridor.',choices:[{id:'escort',label:'ESKORTIEREN',result:'Der Konvoi erreicht den Außenposten.',reward:{sagReputation:4,kiwimiTrust:4,credits:140}},{id:'route',label:'SICHERE ROUTE MARKIEREN',result:'Deine Navigationsdaten helfen allen folgenden Schiffen.',reward:{sagReputation:3,commandData:3}}]},
    {id:'kiwimi',title:'KIWIMIS DIREKTKANAL',text:'„Du kannst jetzt umkehren. Oder du zeigst mir, warum du hier bist.“',choices:[{id:'accept',label:'WEITER IN DIE FRONTIER',result:'Kiwimi markiert dich als Anwärter mit Initiative.',reward:{sagReputation:5,kiwimiTrust:5}},{id:'measure',label:'RISIKO ZUERST ANALYSIEREN',result:'Kiwimi akzeptiert die kontrollierte Entscheidung.',reward:{kiwimiTrust:3,commandData:2}}]}
  ];
  const defaults=()=>({version:VERSION,faction:null,factionChosenAt:0,introSeen:false,sagReputation:0,kiwimiTrust:0,factionReputation:0,claimedMissions:[],loreUnlocked:[],eventHistory:[],seenScenes:[],chapter:1,admitted:false,ending:null,reducedMotion:false,lastEventRun:0,totalEvents:0,lastDebriefRun:0});
  const copy=value=>JSON.parse(JSON.stringify(value));
  function normalize(raw){
    const base=defaults(),value=raw&&typeof raw==='object'?raw:{};
    const out={...base,...value,version:VERSION};
    for(const key of ['claimedMissions','loreUnlocked','eventHistory','seenScenes'])out[key]=Array.isArray(out[key])?[...new Set(out[key])]:[];
    for(const key of ['sagReputation','kiwimiTrust','factionReputation','chapter','totalEvents','lastEventRun','lastDebriefRun'])out[key]=Math.max(0,Number(out[key])||0);
    out.chapter=Math.max(1,Math.min(5,out.chapter||1));
    if(!FACTIONS[out.faction])out.faction=null;
    out.introSeen=Boolean(out.introSeen);out.admitted=Boolean(out.admitted);out.reducedMotion=Boolean(out.reducedMotion);
    return out;
  }
  function baseStats(base){const s=base?.stats||{};return{runs:Number(s.runs)||0,kills:Number(s.kills)||0,bosses:Number(s.bosses)||0,discoveries:Number(s.discoveries)||0,stations:Number(s.stations)||0,asteroids:Number(s.asteroids)||0,distance:Number(s.distance)||0};}
  function context(base,progression,story){return{base:base||{},progression:progression||{},story:normalize(story),stats:baseStats(base)}}
  function applyBaseReward(base,reward){
    const out=copy(base||{});out.credits=(Number(out.credits)||0)+(Number(reward.credits)||0);out.cores=(Number(out.cores)||0)+(Number(reward.cores)||0);out.skillPoints=(Number(out.skillPoints)||0)+(Number(reward.skillPoints)||0);out.pilotXp=(Number(out.pilotXp)||0)+(Number(reward.pilotXp)||0);return out;
  }
  function applyProgressionReward(progression,reward){const out=copy(progression||{});out.commandData=(Number(out.commandData)||0)+(Number(reward.commandData)||0);out.totalDataEarned=(Number(out.totalDataEarned)||0)+Math.max(0,Number(reward.commandData)||0);return out;}
  function applyStoryReward(story,reward){const out=normalize(story);out.sagReputation=Math.max(0,out.sagReputation+(Number(reward.sagReputation)||0));out.kiwimiTrust=Math.max(0,out.kiwimiTrust+(Number(reward.kiwimiTrust)||0));out.factionReputation=Math.max(0,out.factionReputation+(Number(reward.factionReputation)||0));if(reward.lore&&!out.loreUnlocked.includes(reward.lore))out.loreUnlocked.push(reward.lore);return out;}
  function chooseFaction(story,base,progression,id){
    if(!FACTIONS[id])return{ok:false,reason:'unknown-faction',story:normalize(story),base:copy(base||{}),progression:copy(progression||{})};
    const current=normalize(story);if(current.faction)return{ok:false,reason:'already-chosen',story:current,base:copy(base||{}),progression:copy(progression||{})};
    let nextBase=copy(base||{}),nextProgression=copy(progression||{});nextBase.skills={...(nextBase.skills||{})};
    if(id==='mud'){nextBase.skills.hull=(Number(nextBase.skills.hull)||0)+1;nextBase.credits=(Number(nextBase.credits)||0)+180;}
    if(id==='oni'){nextBase.skills.damage=(Number(nextBase.skills.damage)||0)+1;nextBase.pilotXp=(Number(nextBase.pilotXp)||0)+80;}
    if(id==='ustur'){nextBase.skills.cooldown=(Number(nextBase.skills.cooldown)||0)+1;nextProgression.commandData=(Number(nextProgression.commandData)||0)+2;}
    current.faction=id;current.factionChosenAt=Date.now();current.introSeen=true;current.loreUnlocked=[...new Set([...current.loreUnlocked,'kiwimi-founder','sag-origin','three-factions'])];
    return{ok:true,story:current,base:nextBase,progression:nextProgression};
  }
  function unlockLore(story,base,progression){
    const ctx=context(base,progression,story),set=new Set(ctx.story.loreUnlocked);
    if(ctx.story.faction){set.add('kiwimi-founder');set.add('sag-origin');set.add('three-factions');}
    if(ctx.stats.discoveries>=2)set.add('frontier-signal');if(ctx.stats.bosses>=1)set.add('warden-protocol');if((Number(ctx.progression.completedContracts)||0)>=1)set.add('command-network');if(ctx.stats.distance>=8000)set.add('anomaly-theory');if(ctx.story.sagReputation>=40)set.add('founding-charter');if(ctx.stats.bosses>=5)set.add('black-signal');if(ctx.story.admitted)set.add('membership');
    const next=normalize(ctx.story);next.loreUnlocked=[...set];return next;
  }
  function metricValue(mission,ctx){
    const s=ctx.stats,p=ctx.progression,t=ctx.story;
    switch(mission.metric){
      case'faction':return t.faction?1:0;case'runs':return s.runs;case'signal':return Math.max(s.discoveries,Math.floor(s.distance/750));case'kills':return s.kills;case'salvage':return Math.max(s.asteroids,Math.floor(s.stations*3));case'bosses':return s.bosses;case'distance':return s.distance;case'contracts':return Number(p.completedContracts)||0;case'discoveries':return s.discoveries;case'lore':return t.loreUnlocked.length;case'trustGate':return t.sagReputation>=45&&t.kiwimiTrust>=35?1:0;case'blackSignal':return s.bosses>=5&&s.distance>=30000?1:0;case'candidate':return t.sagReputation>=70&&t.kiwimiTrust>=55?1:0;case'finalTrial':return s.kills>=450&&s.bosses>=8&&s.runs>=12?1:0;case'admission':return t.claimedMissions.length>=MISSIONS.length-1?1:0;default:return 0;
    }
  }
  function campaignStates(story,base,progression){
    const updated=unlockLore(story,base,progression),ctx=context(base,progression,updated);let previous=true;
    return MISSIONS.map((mission,index)=>{const claimed=updated.claimedMissions.includes(mission.id),value=metricValue(mission,ctx),ready=value>=mission.target,unlocked=index===0||previous,claimable=unlocked&&ready&&!claimed;previous=previous&&claimed;return{...mission,index,claimed,value,ready,unlocked,claimable,ratio:Math.min(1,value/mission.target)};});
  }
  function claimMission(story,base,progression,id){
    const states=campaignStates(story,base,progression),state=states.find(item=>item.id===id);if(!state||!state.claimable)return{ok:false,reason:'not-claimable',story:normalize(story),base:copy(base||{}),progression:copy(progression||{})};
    let nextStory=applyStoryReward(unlockLore(story,base,progression),state.reward);nextStory.claimedMissions.push(id);nextStory.chapter=Math.min(5,Math.max(nextStory.chapter,state.chapter+(state.index%3===2?1:0)));let nextBase=applyBaseReward(base,state.reward),nextProgression=applyProgressionReward(progression,state.reward);
    if(id==='c5-admission'){nextStory.admitted=true;nextStory.ending=endingFor(nextStory,nextBase,nextProgression);nextStory.loreUnlocked=[...new Set([...nextStory.loreUnlocked,'membership'])];}
    return{ok:true,state,story:nextStory,base:nextBase,progression:nextProgression};
  }
  function resolveEvent(story,base,progression,eventId,choiceId){
    const event=EVENTS.find(item=>item.id===eventId),choice=event?.choices.find(item=>item.id===choiceId);if(!event||!choice)return{ok:false,story:normalize(story),base:copy(base||{}),progression:copy(progression||{})};
    let reward={...choice.reward};const faction=FACTIONS[normalize(story).faction];if(faction?.id==='mud'&&reward.credits)reward.credits=Math.round(reward.credits*1.12);if(faction?.id==='oni'&&reward.kiwimiTrust>0)reward.kiwimiTrust+=1;if(faction?.id==='ustur'&&reward.commandData)reward.commandData+=1;
    let nextStory=applyStoryReward(story,reward);nextStory.totalEvents+=1;nextStory.eventHistory.push({event:eventId,choice:choiceId,at:Date.now()});nextStory.eventHistory=nextStory.eventHistory.slice(-30);
    return{ok:true,event,choice,reward,story:nextStory,base:applyBaseReward(base,reward),progression:applyProgressionReward(progression,reward)};
  }
  function endingFor(story){const t=normalize(story);if(t.sagReputation>=110&&t.kiwimiTrust>=90)return'elite';if(t.factionReputation>=30)return`${t.faction}-envoy`;return'member';}
  function candidateStatus(story){const t=normalize(story);if(t.admitted)return t.ending==='elite'?'SAG ELITE-PILOT':'SAG MITGLIED';if(t.sagReputation>=70&&t.kiwimiTrust>=55)return'AUFNAHMEPRÜFUNG';if(t.sagReputation>=40)return'FORTGESCHRITTENER ANWÄRTER';if(t.faction)return'SAG ANWÄRTER';return'UNREGISTRIERT';}
  return{VERSION,FACTIONS,LORE,MISSIONS,CHAPTERS,EVENTS,defaults,normalize,baseStats,context,chooseFaction,unlockLore,campaignStates,claimMission,resolveEvent,endingFor,candidateStatus,applyStoryReward,applyBaseReward,applyProgressionReward};
});