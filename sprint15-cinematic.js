(()=>{
  'use strict';
  const Core=window.SAGStoryCore;if(!Core)throw new Error('SAGStoryCore missing');
  const STORY_KEY='sag-frontier-story-v19',BASE_KEY='sag-frontier-save-v05',PROGRESSION_KEY='sag-frontier-progression-v14';
  const root=document.getElementById('sagStoryShell'),content=document.getElementById('sagStoryContent'),toggle=document.getElementById('sagStoryToggle'),frame=document.getElementById('gameFrame');
  let story=loadStory(),currentTab='home',sceneIndex=0,sceneTimer=0,renderers={};
  const scenes=[
    {kicker:'PROLOG // OUTER FRONTIER',title:'DIE FRONTIER VERÄNDERT SICH',text:'Ein unbekanntes Signal bewegt sich durch die Risszonen. Es antwortet weder MUD, ONI noch Ustur.',visual:'rift'},
    {kicker:'DREI MACHTBLÖCKE',title:'JEDER FLIEGT FÜR SEINE HERKUNFT',text:'Industrie. Präzision. Technologie. Doch keine Fraktion besitzt allein das vollständige Lagebild.',visual:'fleet'},
    {kicker:'SAG REKRUTIERUNGSKANAL',title:'KIWIMI SUCHT DIE, DIE VERBINDEN',text:'Als Gründer von Star Atlas Germany ruft Kiwimi Anwärter aus allen drei Fraktionen zusammen.',visual:'kiwimi'},
    {kicker:'STAR ATLAS GERMANY',title:'KEIN ABZEICHEN. EIN VERSPRECHEN.',text:'SAG steht für gemeinsames Wissen, verlässliche Crews und Verantwortung jenseits von Fraktionsgrenzen.',visual:'emblem'},
    {kicker:'DEIN AUFTRAG',title:'VERDIENE DIR DEINEN PLATZ',text:'Wähle deine Herkunft. Folge Kiwimis Kampagne. Beweise, dass du bereit bist, Teil von SAG zu werden.',visual:'choice'}
  ];
  function loadJson(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}}
  function loadStory(){return Core.normalize(loadJson(STORY_KEY,Core.defaults()))}
  function saveStory(next=story){story=Core.normalize(next);localStorage.setItem(STORY_KEY,JSON.stringify(story));applyFactionTheme();refreshMetrics();return story}
  function getBase(){return loadJson(BASE_KEY,{})}
  function getProgression(){return loadJson(PROGRESSION_KEY,{})}
  function saveContext(nextStory,nextBase,nextProgression){saveStory(nextStory);localStorage.setItem(BASE_KEY,JSON.stringify(nextBase||{}));localStorage.setItem(PROGRESSION_KEY,JSON.stringify(nextProgression||{}));syncGameSave(nextBase);return{story,nextBase,nextProgression}}
  function syncGameSave(base){const doc=frame?.contentDocument;if(!doc)return;try{const area=doc.getElementById('importArea'),button=doc.getElementById('importBtn');if(area&&button){area.value=btoa(unescape(encodeURIComponent(JSON.stringify(base||{}))));button.click();const notice=doc.getElementById('dataNotice');if(notice)notice.textContent='';}}catch{}}
  function applyFactionTheme(){document.body.classList.remove('faction-mud','faction-oni','faction-ustur');if(story.faction)document.body.classList.add(`faction-${story.faction}`)}
  function candidate(){return Core.candidateStatus(story)}
  function refreshMetrics(){
    const faction=story.faction?Core.FACTIONS[story.faction].name:'OFFEN';
    const map={sagMetricStatus:candidate(),sagMetricFaction:faction,sagMetricReputation:story.sagReputation,sagMetricTrust:story.kiwimiTrust};
    Object.entries(map).forEach(([id,value])=>{const node=document.getElementById(id);if(node)node.textContent=value});
    const badge=document.getElementById('sagStoryBadge');if(badge)badge.textContent=story.chapter;
  }
  function closeOtherOverlays(){const command=document.getElementById('commandCenter');if(command&&!command.classList.contains('hidden'))document.getElementById('commandClose')?.click()}
  function openHQ(tab=currentTab){closeOtherOverlays();root.classList.remove('sag-hidden');toggle.setAttribute('aria-expanded','true');setTab(tab);document.body.style.overflow='hidden'}
  function closeHQ(){root.classList.add('sag-hidden');toggle.setAttribute('aria-expanded','false');document.body.style.overflow='';frame?.contentWindow?.focus()}
  function setTab(name){currentTab=name;document.querySelectorAll('#sagStoryTabs button').forEach(button=>button.classList.toggle('active',button.dataset.sagTab===name));const renderer=renderers[name]||renderHome;renderer();refreshMetrics()}
  function registerTab(name,renderer){renderers[name]=renderer}
  function renderHome(){
    const faction=story.faction?Core.FACTIONS[story.faction]:null,states=Core.campaignStates(story,getBase(),getProgression()),next=states.find(item=>!item.claimed),chapter=Core.CHAPTERS[Math.max(0,story.chapter-1)];
    content.innerHTML=`<section class="sag-hero"><article class="sag-hero-card"><span class="sag-kicker">SAG REKRUTIERUNG // ${candidate()}</span><h2>${story.admitted?'DU BIST TEIL VON SAG.':'VERDIENE DIR DEINEN PLATZ.'}</h2><p>${story.admitted?'Deine Aufnahme ist bestätigt. Kiwimi erwartet, dass du dein Wissen nun an die nächste Generation von Anwärtern weitergibst.':'Kiwimi hat deinen Kanal geöffnet. Jeder Einsatz, jede Entdeckung und jede Entscheidung fließt in deine Aufnahmebewertung ein.'}</p><div class="sag-hero-actions"><button class="sag-btn primary" data-go="campaign">KAMPAGNE ÖFFNEN</button><button class="sag-btn" data-go="lore">SAG-CODEX</button><button class="sag-btn" data-command>COMMAND PROGRESSION</button></div></article><aside class="sag-kiwimi-card"><span class="sag-kicker">KIWIMI // GRÜNDER VON SAG</span><h3>${story.admitted?'„Willkommen in der Crew.“':'„Herkunft öffnet Türen. Charakter entscheidet, ob sie offen bleiben.“'}</h3><p>${next?`Nächster Auftrag: ${next.title}. ${next.text}`:'Die Kampagnenprüfung ist vollständig abgeschlossen.'}</p></aside></section><section class="sag-first-mission"><article><b>AKTUELLES KAPITEL</b><span>${chapter.title} · ${chapter.subtitle}</span></article><article><b>DEINE HERKUNFT</b><span>${faction?`${faction.name} · ${faction.title}`:'Noch keine Fraktion gewählt'}</span></article><article><b>AUFNAHMEFORTSCHRITT</b><span>${story.claimedMissions.length} / ${Core.MISSIONS.length} Kampagnenmissionen</span></article></section>`;
    content.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>setTab(button.dataset.go)));
    content.querySelector('[data-command]')?.addEventListener('click',()=>{closeHQ();document.getElementById('commandToggle')?.click()});
  }
  function buildIntro(){
    const intro=document.getElementById('sagIntro');if(!intro)return;
    intro.innerHTML=`<div class="sag-intro-stage"><div id="sagIntroScenes"></div><div class="sag-intro-controls"><div id="sagIntroProgress" class="sag-intro-progress"></div><div class="sag-intro-actions"><button id="sagIntroSkip" class="sag-btn">ÜBERSPRINGEN</button><button id="sagIntroNext" class="sag-btn primary">WEITER</button></div></div></div>`;
    const holder=document.getElementById('sagIntroScenes');
    scenes.forEach(scene=>{const node=document.createElement('article');node.className='sag-intro-scene';node.innerHTML=`<div class="sag-space"></div>${scene.visual==='rift'?'<div class="sag-rift"></div>':''}${scene.visual==='fleet'?'<div class="sag-fleet"><i class="sag-ship"></i><i class="sag-ship"></i><i class="sag-ship"></i></div>':''}${scene.visual==='kiwimi'?'<div class="sag-kiwimi-art"><i class="sag-visor"></i></div>':''}${scene.visual==='emblem'||scene.visual==='choice'?'<div class="sag-emblem"></div>':''}<div class="sag-intro-copy"><span>${scene.kicker}</span><h2>${scene.title}</h2><p>${scene.text}</p></div>`;holder.append(node)});
    document.getElementById('sagIntroProgress').innerHTML=scenes.map(()=>'<i></i>').join('');
    document.getElementById('sagIntroNext').addEventListener('click',nextScene);document.getElementById('sagIntroSkip').addEventListener('click',finishIntro);showScene(0);
  }
  function showScene(index){clearTimeout(sceneTimer);sceneIndex=Math.max(0,Math.min(scenes.length-1,index));document.querySelectorAll('.sag-intro-scene').forEach((node,i)=>node.classList.toggle('active',i===sceneIndex));document.querySelectorAll('#sagIntroProgress i').forEach((node,i)=>node.classList.toggle('active',i<=sceneIndex));const next=document.getElementById('sagIntroNext');if(next)next.textContent=sceneIndex===scenes.length-1?'FRAKTION WÄHLEN':'WEITER';if(!story.reducedMotion)sceneTimer=setTimeout(nextScene,7200)}
  function nextScene(){if(sceneIndex>=scenes.length-1)finishIntro();else showScene(sceneIndex+1)}
  function finishIntro(){clearTimeout(sceneTimer);story.introSeen=true;saveStory();document.getElementById('sagIntro')?.classList.add('sag-hidden');showFactionChoice()}
  function showFactionChoice(){const stage=document.getElementById('sagFactionStage');if(!stage)return;if(story.faction){stage.classList.add('sag-hidden');openHQ();return}stage.classList.remove('sag-hidden');stage.innerHTML=`<section class="sag-faction-panel"><header class="sag-faction-head"><span>SAG AUFNAHMEPROTOKOLL // SCHRITT 1</span><h2>WÄHLE DEINE HERKUNFT</h2><p>SAG vereint Piloten aller drei Fraktionen. Deine Wahl verändert Startbonus, Farbe, Dialoge und spätere Anerkennung – nicht dein Recht, dir einen Platz zu verdienen.</p></header><div class="sag-faction-grid"></div></section>`;const grid=stage.querySelector('.sag-faction-grid');Object.values(Core.FACTIONS).forEach(faction=>{const card=document.createElement('button');card.type='button';card.className='sag-faction-card';card.style.setProperty('--card',faction.accent);card.innerHTML=`<div class="sigil">${faction.name}</div><strong>${faction.title}</strong><h3>${faction.name}</h3><p>${faction.description}</p><small>${faction.bonus}</small>`;card.addEventListener('click',()=>selectFaction(faction.id));grid.append(card)})}
  function selectFaction(id){const result=Core.chooseFaction(story,getBase(),getProgression(),id);if(!result.ok)return;saveContext(result.story,result.base,result.progression);document.getElementById('sagFactionStage')?.classList.add('sag-hidden');showKiwimi('KANAL BESTÄTIGT',`${Core.FACTIONS[id].name} ist deine Herkunft. SAG wird zeigen, wer du wirst.`);openHQ('home')}
  function showKiwimi(title,text){const toast=document.getElementById('sagKiwimiToast');if(!toast)return;toast.innerHTML=`<i></i><div><span>KIWIMI // DIREKTKANAL</span><b>${title}</b><p>${text}</p></div>`;toast.classList.add('show');clearTimeout(showKiwimi.timer);showKiwimi.timer=setTimeout(()=>toast.classList.remove('show'),6200)}
  function replayIntro(){sessionStorage.setItem('sag-replay-intro','1');location.replace(`sprint19.html?build=0190&replay=${Date.now()}`)}
  function init(){
    const replay=sessionStorage.getItem('sag-replay-intro')==='1';if(replay)sessionStorage.removeItem('sag-replay-intro');
    applyFactionTheme();refreshMetrics();buildIntro();registerTab('home',renderHome);
    toggle.addEventListener('click',()=>openHQ());document.getElementById('sagStoryClose')?.addEventListener('click',closeHQ);document.getElementById('sagStoryReturn')?.addEventListener('click',closeHQ);document.getElementById('sagStoryTabs')?.addEventListener('click',event=>{const button=event.target.closest('button[data-sag-tab]');if(button)setTab(button.dataset.sagTab)});root.addEventListener('click',event=>{if(event.target===root)closeHQ()});addEventListener('keydown',event=>{if(event.key==='Escape'&&!root.classList.contains('sag-hidden'))closeHQ()});frame?.addEventListener('load',()=>syncGameSave(getBase()));
    if(!story.faction||replay){document.getElementById('sagIntro')?.classList.remove('sag-hidden');document.getElementById('sagFactionStage')?.classList.add('sag-hidden');showScene(0)}else{document.getElementById('sagIntro')?.classList.add('sag-hidden');document.getElementById('sagFactionStage')?.classList.add('sag-hidden');setTimeout(()=>openHQ('home'),450)}
  }
  window.SAGRecruitment={Core,get story(){return story},loadStory,saveStory,getBase,getProgression,saveContext,openHQ,closeHQ,setTab,registerTab,renderHome,showKiwimi,refreshMetrics,syncGameSave,replayIntro};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();