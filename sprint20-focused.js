(()=>{
  'use strict';
  const App=window.SAGRecruitment,Core=window.SAGStoryCore;
  if(!App||!Core)throw new Error('Focused SAG interface dependencies missing');
  const content=document.getElementById('sagStoryContent');
  let selectedChapter=Math.max(1,Math.min(5,App.story.chapter||1));
  let selectedLore=null;
  const labels={sagReputation:'SAG-Ruf',kiwimiTrust:'Vertrauen',factionReputation:'Fraktionsruf',credits:'Credits',cores:'Kerne',pilotXp:'Piloten-EP',skillPoints:'Skill-Punkt',commandData:'Command Data'};
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const rewardHtml=reward=>Object.entries(reward||{}).filter(([,value])=>typeof value==='number'&&value>0).map(([key,value])=>`<i>+${value} ${labels[key]||key}</i>`).join('');
  const header=(kicker,title,text='')=>`<header class="focus-header"><div><span class="focus-kicker">${kicker}</span><h2>${title}</h2></div>${text?`<p>${text}</p>`:''}</header>`;
  const requirement=(label,value,target)=>{const ratio=clamp(value/target,0,1);return `<div class="focus-requirement"><label>${label}</label><div class="track"><i style="width:${ratio*100}%"></i></div><b>${Math.min(value,target)} / ${target}</b></div>`};
  function context(){return{story:App.story,base:App.getBase(),progression:App.getProgression()}}
  function states(){const {story,base,progression}=context();return Core.campaignStates(story,base,progression)}
  function nextMission(){return states().find(item=>!item.claimed)}
  function overallProgress(story=App.story){const parts=[clamp(story.sagReputation/70,0,1),clamp(story.kiwimiTrust/55,0,1),clamp(story.claimedMissions.length/Core.MISSIONS.length,0,1),clamp(story.loreUnlocked.length/6,0,1)];return Math.round(parts.reduce((sum,item)=>sum+item,0)/parts.length*100)}
  function renderHome(){
    const story=App.story,faction=story.faction?Core.FACTIONS[story.faction]:null,next=nextMission(),progress=overallProgress(story);
    content.innerHTML=`<div class="focus-page">${header('SAG REKRUTIERUNG',story.admitted?'Willkommen bei SAG':'Dein nächster Schritt','Nur das nächste relevante Ziel wird hervorgehoben. Details bleiben in den jeweiligen Bereichen.')}<div class="focus-grid-2"><section class="focus-card focus-primary"><span class="focus-kicker">${next?'AKTUELLER AUFTRAG':'KAMPAGNE ABGESCHLOSSEN'}</span><h2 class="focus-title">${next?next.title:'Mitgliedsstatus bestätigt'}</h2><p class="focus-copy">${next?next.text:'Deine Aufnahme ist abgeschlossen. Das HQ bleibt als übersichtliche Einsatz- und Wissenszentrale verfügbar.'}</p><div class="focus-meta"><span class="focus-pill"><b>${progress}%</b> Aufnahme</span><span class="focus-pill"><b>${faction?.name||'Offen'}</b> Herkunft</span><span class="focus-pill"><b>${story.claimedMissions.length}/${Core.MISSIONS.length}</b> Missionen</span></div><div class="focus-actions"><button id="focusContinue" class="sag-btn primary">${next?'Kampagne fortsetzen':'Profil ansehen'}</button><button id="focusCommand" class="sag-btn">Command öffnen</button></div></section><aside class="focus-card focus-kiwimi"><span class="focus-kicker">KIWIMI // DIREKTKANAL</span><h3>${story.admitted?'„Aus Bewerbung wird Verantwortung.“':'„Konzentriere dich auf den nächsten guten Schritt.“'}</h3><p>${next?`Ich erwarte keine perfekte Übersicht. Erfülle ${next.title} und werte danach neu aus.`:'Du hast bewiesen, dass du Wissen, Verlässlichkeit und gemeinsames Handeln verbinden kannst.'}</p></aside></div></div>`;
    document.getElementById('focusContinue')?.addEventListener('click',()=>App.setTab(next?'campaign':'profile'));
    document.getElementById('focusCommand')?.addEventListener('click',()=>{App.closeHQ();document.getElementById('commandToggle')?.click()});
  }
  function renderCampaign(){
    const all=states(),chapter=Core.CHAPTERS[selectedChapter-1]||Core.CHAPTERS[0],chapterStates=all.filter(item=>item.chapter===selectedChapter),active=chapterStates.find(item=>!item.claimed),claimed=chapterStates.filter(item=>item.claimed).length;
    content.innerHTML=`<div class="focus-page">${header(`KAPITEL ${selectedChapter} // ${chapter.title}`,chapter.subtitle,chapter.scene)}<nav id="focusChapters" class="focus-chapters"></nav><section class="focus-card focus-primary" id="focusMission"></section><section class="focus-history" id="focusHistory"></section></div>`;
    const nav=document.getElementById('focusChapters');
    Core.CHAPTERS.forEach(item=>{const chapterMissions=all.filter(state=>state.chapter===item.id),done=chapterMissions.every(state=>state.claimed),available=item.id===1||all.filter(state=>state.chapter<item.id).every(state=>state.claimed),button=document.createElement('button');button.type='button';button.className=`focus-chapter ${item.id===selectedChapter?'active':''} ${done?'complete':''}`;button.disabled=!available;button.textContent=`${item.id}. ${item.title}`;button.addEventListener('click',()=>{selectedChapter=item.id;renderCampaign()});nav.append(button)});
    const mission=document.getElementById('focusMission');
    if(active){const absoluteIndex=Core.MISSIONS.findIndex(item=>item.id===active.id)+1;mission.innerHTML=`<div class="focus-mission"><div class="focus-mission-index">${String(absoluteIndex).padStart(2,'0')}</div><div><span class="focus-kicker">${active.claimable?'BEREIT ZUM ABSCHLUSS':'AKTIVES ZIEL'}</span><h3>${active.title}</h3><p>${active.text}</p><div class="focus-progress"><div class="track"><i style="width:${active.ratio*100}%"></i></div><span>${Math.min(active.value,active.target)} / ${active.target}</span></div><div class="focus-rewards">${rewardHtml(active.reward)}</div></div><button id="focusClaimMission" class="sag-btn ${active.claimable?'primary':''}" ${active.claimable?'':'disabled'}>${active.claimable?'Belohnung sichern':'Ziel noch offen'}</button></div>`;document.getElementById('focusClaimMission')?.addEventListener('click',()=>claimMission(active));}
    else{mission.innerHTML=`<span class="focus-kicker">KAPITEL ABGESCHLOSSEN</span><h3>${chapter.title}</h3><p class="focus-copy">Alle drei Missionen sind abgeschlossen.${selectedChapter<5?' Das nächste Kapitel ist freigeschaltet.':' Die Aufnahmebewertung ist vollständig.'}</p>${selectedChapter<5?'<div class="focus-actions"><button id="focusNextChapter" class="sag-btn primary">Nächstes Kapitel</button></div>':''}`;document.getElementById('focusNextChapter')?.addEventListener('click',()=>{selectedChapter++;renderCampaign()})}
    const history=document.getElementById('focusHistory');chapterStates.forEach(item=>{const row=document.createElement('article');row.className=item.claimed?'done':item===active?'active':'locked';row.innerHTML=`<b>${item.title}</b><span>${item.claimed?'Abgeschlossen':item===active?'Aktuell':'Folgt später'}</span>`;history.append(row)});
  }
  function claimMission(mission){
    const result=Core.claimMission(App.story,App.getBase(),App.getProgression(),mission.id);if(!result.ok)return;
    App.saveContext(result.story,result.base,result.progression);App.showKiwimi('MISSION BESTÄTIGT',`${mission.title} ist abgeschlossen.`);
    const chapterDone=states().filter(item=>item.chapter===mission.chapter).every(item=>item.claimed);
    if(chapterDone&&mission.chapter<5)selectedChapter=mission.chapter+1;
    renderCampaign();
    if(result.story.admitted&&typeof App.onAdmission==='function')App.onAdmission(result.story);
  }
  function renderLore(){
    const updated=Core.unlockLore(App.story,App.getBase(),App.getProgression());if(updated.loreUnlocked.length!==App.story.loreUnlocked.length)App.saveStory(updated);
    const unlocked=Core.LORE.filter(item=>updated.loreUnlocked.includes(item.id)),nextLocked=Core.LORE.find(item=>!updated.loreUnlocked.includes(item.id));
    if(!selectedLore||!updated.loreUnlocked.includes(selectedLore))selectedLore=unlocked[0]?.id||null;
    const current=Core.LORE.find(item=>item.id===selectedLore),visible=nextLocked?[...unlocked,nextLocked]:unlocked;
    content.innerHTML=`<div class="focus-page">${header('SAG CODEX','Wissen, das du tatsächlich freigeschaltet hast',`${unlocked.length} von ${Core.LORE.length} Einträgen verfügbar. Gesperrte Inhalte werden nicht als große leere Karten gezeigt.`)}<div class="focus-lore"><nav id="focusLoreList" class="focus-lore-list"></nav><article id="focusLoreReader" class="focus-card focus-lore-reader"></article></div></div>`;
    const list=document.getElementById('focusLoreList');visible.forEach(entry=>{const open=updated.loreUnlocked.includes(entry.id),button=document.createElement('button');button.type='button';button.className=`${entry.id===selectedLore?'active':''} ${open?'':'locked'}`;button.textContent=open?entry.title:'Nächster Eintrag verschlüsselt';button.disabled=!open;button.addEventListener('click',()=>{selectedLore=entry.id;renderLore()});list.append(button)});
    const reader=document.getElementById('focusLoreReader');reader.innerHTML=current?`<span class="focus-kicker">${current.tag}</span><h3>${current.title}</h3><p>${current.text}</p><div class="focus-lock-note">${Core.LORE.length-unlocked.length} weitere Einträge werden durch Kampagne und Einsätze freigeschaltet.</div>`:`<span class="focus-kicker">CODEX OFFLINE</span><h3>Noch kein Eintrag freigeschaltet</h3><p>Folge dem ersten Kampagnenauftrag. Der Codex wächst nur durch relevante Entdeckungen.</p>`;
  }
  function renderProfile(){
    const story=Core.unlockLore(App.story,App.getBase(),App.getProgression());if(story.loreUnlocked.length!==App.story.loreUnlocked.length)App.saveStory(story);
    const faction=story.faction?Core.FACTIONS[story.faction]:null,score=overallProgress(story),status=Core.candidateStatus(story);
    content.innerHTML=`<div class="focus-page">${header('SAG PROFIL',story.admitted?'Mitgliedsprofil':'Aufnahmefortschritt','Vier Kriterien bestimmen den Zugang. Weitere Statistiken bleiben im Command Center.')}<div class="focus-profile"><section class="focus-card focus-primary"><div class="focus-score"><div><span class="focus-kicker">${status}</span><h3>${faction?`${faction.name}-PILOT`:'HERKUNFT OFFEN'}</h3></div><div><strong>${score}%</strong><span>Gesamtfortschritt</span></div></div><div class="focus-requirements">${requirement('SAG-RUF',story.sagReputation,70)}${requirement('VERTRAUEN',story.kiwimiTrust,55)}${requirement('MISSIONEN',story.claimedMissions.length,Core.MISSIONS.length)}${requirement('CODEX',story.loreUnlocked.length,6)}</div><div class="focus-actions"><button id="focusBriefing" class="sag-btn primary">Kiwimi-Briefing</button><button id="focusReplayIntro" class="sag-btn">Intro wiederholen</button></div><div class="focus-settings"><label><input id="focusReducedMotion" type="checkbox" ${story.reducedMotion?'checked':''}> Animationen reduzieren</label></div></section><aside class="focus-card"><span class="focus-kicker">SAG LEITWERTE</span><div class="focus-values"><article><b>ENTDECKEN</b><span>Relevante Informationen sichern.</span></article><article><b>VERBINDEN</b><span>Fraktionsstärken zusammenführen.</span></article><article><b>BEWÄHREN</b><span>Unter Druck verlässlich handeln.</span></article></div>${story.admitted?'<div class="focus-actions"><button id="focusFinale" class="sag-btn primary">Aufnahmezeremonie</button></div>':''}</aside></div></div>`;
    document.getElementById('focusBriefing')?.addEventListener('click',()=>App.showKiwimi('BEWERBUNGSSTATUS',story.admitted?'Du bist aufgenommen. Jetzt zählt, was du für andere Piloten möglich machst.':`${score}% erreicht. Konzentriere dich auf das schwächste der vier Kriterien.`));
    document.getElementById('focusReplayIntro')?.addEventListener('click',()=>{sessionStorage.setItem('sag-replay-intro','1');location.replace(`sprint20.html?build=0200&replay=${Date.now()}`)});
    document.getElementById('focusReducedMotion')?.addEventListener('change',event=>{App.saveStory({...App.story,reducedMotion:event.target.checked});document.body.classList.toggle('sag-reduced-motion',event.target.checked)});
    document.getElementById('focusFinale')?.addEventListener('click',()=>App.showFinale?.(story,true));
  }
  function harmonizeChrome(){
    const names={home:'START',campaign:'KAMPAGNE',lore:'WISSEN',profile:'PROFIL'};
    document.querySelectorAll('#sagStoryTabs [data-sag-tab]').forEach(button=>{const name=button.dataset.sagTab;if(names[name])button.textContent=names[name];if(name==='admission')button.style.display='none'});
    const title=document.getElementById('sagStoryTitle');if(title)title.textContent='SAG HQ';
    const toggle=document.querySelector('#sagStoryToggle span');if(toggle)toggle.textContent='SAG HQ';
  }
  App.registerTab('home',renderHome);App.registerTab('campaign',renderCampaign);App.registerTab('lore',renderLore);App.registerTab('profile',renderProfile);
  App.renderHome=renderHome;App.renderCampaign=renderCampaign;
  harmonizeChrome();
  const observer=new MutationObserver(harmonizeChrome);observer.observe(document.getElementById('sagStoryTabs'),{childList:true,subtree:true});
  if(!document.getElementById('sagStoryShell')?.classList.contains('sag-hidden'))App.setTab('home');
})();
