(()=>{
  'use strict';
  const App=window.SAGRecruitment,Core=window.SAGStoryCore,Content=window.SAG25Content,Dialogue=window.SAGDialogue;
  if(!App||!Core||!Content||!Dialogue)throw new Error('Sprint 25 narrative dependencies missing');
  const content=document.getElementById('sagStoryContent');
  let selectedChapter=Math.max(1,Math.min(5,App.story.chapter||1)),selectedLore=null,installed=false;
  const labels={sagReputation:'SAG-Ruf',kiwimiTrust:'Vertrauen',factionReputation:'Fraktionsruf',credits:'Credits',cores:'Kerne',pilotXp:'Piloten-EP',skillPoints:'Skill-Punkt',commandData:'Command Data'};
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const rewardHtml=reward=>Object.entries(reward||{}).filter(([,value])=>typeof value==='number'&&value>0).map(([key,value])=>`<i>+${value} ${labels[key]||key}</i>`).join('');
  const header=(kicker,title,text='')=>`<header class="focus-header"><div><span class="focus-kicker">${kicker}</span><h2>${title}</h2></div>${text?`<p>${text}</p>`:''}</header>`;
  const requirement=(label,value,target)=>{const ratio=clamp(value/target,0,1);return `<div class="focus-requirement"><label>${label}</label><div class="track"><i style="width:${ratio*100}%"></i></div><b>${Math.min(value,target)} / ${target}</b></div>`};
  function syncLore(){const updated=Core.unlockLore(App.story,App.getBase(),App.getProgression());if(JSON.stringify(updated.loreUnlocked)!==JSON.stringify(App.story.loreUnlocked))App.saveStory(updated);return updated}
  function states(){syncLore();return Core.campaignStates(App.story,App.getBase(),App.getProgression())}
  function nextMission(){return states().find(item=>!item.claimed)}
  function overallProgress(story=App.story){const parts=[clamp(story.sagReputation/70,0,1),clamp(story.kiwimiTrust/55,0,1),clamp(story.claimedMissions.length/Core.MISSIONS.length,0,1),clamp(story.loreUnlocked.length/6,0,1)];return Math.round(parts.reduce((sum,item)=>sum+item,0)/parts.length*100)}
  function dialogueButton(label='Mit Kiwimi sprechen'){return `<button class="sag-btn" data-kiwimi-dialogue type="button">${label}</button>`}
  function bindDialogue(root=content){root.querySelectorAll('[data-kiwimi-dialogue]').forEach(button=>button.addEventListener('click',()=>Dialogue.open()))}

  function renderHome(){
    const story=syncLore(),faction=story.faction?Core.FACTIONS[story.faction]:null,next=nextMission(),chapter=next?Core.CHAPTERS[next.chapter-1]:Core.CHAPTERS[4],progress=overallProgress(story);
    content.innerHTML=`<div class="focus-page narrative-page">${header('SAG FRONTIER // REKRUTIERUNG',story.admitted?'Mitgliedskanal':'Dein nächster Schritt',story.admitted?'Dein Dossier ist geschlossen. Dein Beitrag zur DAC beginnt jetzt.':'Die Kampagne verbindet bestätigte Star-Atlas-Geschichte mit einer klar gekennzeichneten SAG-Handlung.')}<div class="focus-grid-2"><section class="focus-card focus-primary"><span class="focus-kicker">${next?'AKTUELLER AUFTRAG':'AUFNAHME ABGESCHLOSSEN'}</span><h2 class="focus-title">${next?next.title:'Willkommen bei SAG'}</h2><p class="focus-copy">${next?next.text:'Du bist nicht am Ende einer Rangliste angekommen. Du hast Zugang zu einer Gemeinschaft übernommen, die von deinen Beiträgen lebt.'}</p>${next?`<blockquote class="narrative-brief">${next.brief}</blockquote>`:''}<div class="focus-meta"><span class="focus-pill"><b>${progress}%</b> Aufnahme</span><span class="focus-pill"><b>${faction?.name||'Offen'}</b> Herkunft</span><span class="focus-pill"><b>${story.claimedMissions.length}/${Core.MISSIONS.length}</b> Missionen</span></div><div class="focus-actions"><button id="narrativeContinue" class="sag-btn primary">${next?'Auftrag öffnen':'Profil ansehen'}</button>${dialogueButton()}<button id="narrativeCommand" class="sag-btn">Command</button></div></section><aside class="focus-card focus-kiwimi"><span class="focus-kicker">KIWIMI // GRÜNDER VON SAG</span><h3>„${story.admitted?'Aus Mitgliedschaft wird Verantwortung.':'Deine Herkunft ist ein Ausgangspunkt, keine Ausrede.'}“</h3><p>${next?chapter.question:Content.VOICE.lines.admission}</p></aside></div><p class="narrative-disclaimer">${Content.SAG.disclaimer}</p></div>`;
    document.getElementById('narrativeContinue')?.addEventListener('click',()=>App.setTab(next?'campaign':'profile'));
    document.getElementById('narrativeCommand')?.addEventListener('click',()=>{App.closeHQ();document.getElementById('commandToggle')?.click()});bindDialogue();
  }

  function renderCampaign(){
    const all=states(),chapter=Core.CHAPTERS[selectedChapter-1]||Core.CHAPTERS[0],chapterStates=all.filter(item=>item.chapter===selectedChapter),active=chapterStates.find(item=>!item.claimed);
    content.innerHTML=`<div class="focus-page narrative-page">${header(`KAPITEL ${selectedChapter} // ${chapter.title}`,chapter.subtitle,chapter.scene)}<blockquote class="narrative-question">${chapter.question}</blockquote><nav id="narrativeChapters" class="focus-chapters"></nav><section class="focus-card focus-primary" id="narrativeMission"></section><section class="focus-history" id="narrativeHistory"></section></div>`;
    const nav=document.getElementById('narrativeChapters');Core.CHAPTERS.forEach(item=>{const chapterMissions=all.filter(state=>state.chapter===item.id),done=chapterMissions.every(state=>state.claimed),available=item.id===1||all.filter(state=>state.chapter<item.id).every(state=>state.claimed),button=document.createElement('button');button.type='button';button.className=`focus-chapter ${item.id===selectedChapter?'active':''} ${done?'complete':''}`;button.disabled=!available;button.textContent=`${item.id}. ${item.title}`;button.addEventListener('click',()=>{selectedChapter=item.id;renderCampaign()});nav.append(button)});
    const mission=document.getElementById('narrativeMission');
    if(active){const index=Core.MISSIONS.findIndex(item=>item.id===active.id)+1;mission.innerHTML=`<div class="focus-mission"><div class="focus-mission-index">${String(index).padStart(2,'0')}</div><div><span class="focus-kicker">${active.claimable?'AUSWERTUNG BEREIT':'AKTIVES ZIEL'}</span><h3>${active.title}</h3><p>${active.text}</p><blockquote class="narrative-brief">${active.brief}</blockquote><div class="focus-progress"><div class="track"><i style="width:${active.ratio*100}%"></i></div><span>${Math.min(active.value,active.target)} / ${active.target}</span></div><div class="focus-rewards">${rewardHtml(active.reward)}</div></div><button id="narrativeClaim" class="sag-btn ${active.claimable?'primary':''}" ${active.claimable?'':'disabled'}>${active.claimable?'Mission auswerten':'Ziel noch offen'}</button></div>`;document.getElementById('narrativeClaim')?.addEventListener('click',()=>claimMission(active));}
    else{mission.innerHTML=`<span class="focus-kicker">KAPITEL ABGESCHLOSSEN</span><h3>${chapter.title}</h3><p class="focus-copy">Die drei Entscheidungen dieses Kapitels sind dokumentiert.${selectedChapter<5?' Der nächste Abschnitt ist freigeschaltet.':' Der gemeinsame Rat kann dein vollständiges Dossier prüfen.'}</p><div class="focus-actions">${selectedChapter<5?'<button id="narrativeNextChapter" class="sag-btn primary">Nächstes Kapitel</button>':''}${dialogueButton('Kapitel mit Kiwimi besprechen')}</div>`;document.getElementById('narrativeNextChapter')?.addEventListener('click',()=>{selectedChapter++;renderCampaign()});bindDialogue(mission)}
    const history=document.getElementById('narrativeHistory');chapterStates.forEach(item=>{const row=document.createElement('article');row.className=item.claimed?'done':item===active?'active':'locked';row.innerHTML=`<b>${item.title}</b><span>${item.claimed?'Dokumentiert':item===active?'Aktuell':'Folgt später'}</span>`;history.append(row)});
  }
  function claimMission(mission){
    const result=Core.claimMission(App.story,App.getBase(),App.getProgression(),mission.id);if(!result.ok)return;
    App.saveContext(result.story,result.base,result.progression);App.showKiwimi('MISSION AUSGEWERTET',mission.debrief||`${mission.title} ist abgeschlossen.`);
    const updated=Core.campaignStates(result.story,result.base,result.progression),chapterDone=updated.filter(item=>item.chapter===mission.chapter).every(item=>item.claimed);if(chapterDone&&mission.chapter<5)selectedChapter=mission.chapter+1;renderCampaign();if(result.story.admitted&&typeof App.onAdmission==='function')App.onAdmission(result.story);
  }

  function renderLore(){
    const story=syncLore(),unlocked=Core.LORE.filter(item=>story.loreUnlocked.includes(item.id)),nextLocked=Core.LORE.find(item=>!story.loreUnlocked.includes(item.id));if(!selectedLore||!story.loreUnlocked.includes(selectedLore))selectedLore=unlocked[0]?.id||null;const current=Core.LORE.find(item=>item.id===selectedLore),visible=nextLocked?[...unlocked,nextLocked]:unlocked;
    content.innerHTML=`<div class="focus-page narrative-page">${header('SAG CODEX','Kanon, SAG-Chronik und Feldberichte',`${unlocked.length} von ${Core.LORE.length} Einträgen verfügbar. Jeder Text zeigt, auf welcher Ebene seine Aussage gilt.`)}<div class="focus-lore"><nav id="narrativeLoreList" class="focus-lore-list"></nav><article id="narrativeLoreReader" class="focus-card focus-lore-reader"></article></div></div>`;
    const list=document.getElementById('narrativeLoreList');visible.forEach(entry=>{const open=story.loreUnlocked.includes(entry.id),button=document.createElement('button');button.type='button';button.className=`${entry.id===selectedLore?'active':''} ${open?'':'locked'}`;button.textContent=open?entry.title:'Nächster Eintrag';button.disabled=!open;button.title=open?'':entry.unlockHint||'Durch Kampagne und Einsätze freischalten';button.addEventListener('click',()=>{selectedLore=entry.id;renderLore()});list.append(button)});
    const reader=document.getElementById('narrativeLoreReader');reader.innerHTML=current?`<div class="narrative-source ${current.source?.kind||'campaign'}"><span>${current.source?.label||'KAMPAGNENARCHIV'}</span><b>${current.tag}</b></div><h3>${current.title}</h3><p>${current.text}</p><div class="focus-actions">${dialogueButton('Mit Kiwimi darüber sprechen')}</div><div class="focus-lock-note">${Core.LORE.length-unlocked.length} weitere Einträge werden gezielt über Einsätze, Verträge und Kampagne geöffnet.</div>`:`<span class="focus-kicker">CODEX OFFLINE</span><h3>Noch kein Eintrag freigeschaltet</h3><p>Wähle deine Fraktion und beginne die Kampagne.</p>`;bindDialogue(reader);
  }

  function renderProfile(){
    const story=syncLore(),faction=story.faction?Core.FACTIONS[story.faction]:null,score=overallProgress(story),status=Core.candidateStatus(story),SAG=Content.SAG;
    content.innerHTML=`<div class="focus-page narrative-page">${header('SAG PROFIL',story.admitted?'Mitglied und Mitgestalter':'Aufnahme in eine eigenständige DAC','Vier Kriterien öffnen die Aufnahme. Die Charta bestimmt, was danach zählt.')}<div class="focus-profile"><section class="focus-card focus-primary"><div class="focus-score"><div><span class="focus-kicker">${status}</span><h3>${faction?`${faction.name}-PILOT`:'HERKUNFT OFFEN'}</h3></div><div><strong>${score}%</strong><span>Aufnahmefortschritt</span></div></div><div class="focus-requirements">${requirement('SAG-RUF',story.sagReputation,70)}${requirement('VERTRAUEN',story.kiwimiTrust,55)}${requirement('MISSIONEN',story.claimedMissions.length,Core.MISSIONS.length)}${requirement('CODEX',story.loreUnlocked.length,6)}</div><div class="focus-actions">${dialogueButton()}<button id="narrativeReplayIntro" class="sag-btn">Intro wiederholen</button>${story.admitted?'<button id="narrativeFinale" class="sag-btn primary">Aufnahmezeremonie</button>':''}</div><div class="focus-settings"><label><input id="narrativeReducedMotion" type="checkbox" ${story.reducedMotion?'checked':''}> Animationen reduzieren</label></div></section><aside class="focus-card narrative-dac"><span class="focus-kicker">${SAG.name.toUpperCase()} // SEIT ${SAG.founded}</span><h3>${SAG.type}</h3><p>${SAG.mission}</p><dl><div><dt>Haltung</dt><dd>${SAG.posture}</dd></div><div><dt>Organisation</dt><dd>Karrierebereiche, Fraktionsvertretungen und gemeinsamer Rat.</dd></div><div><dt>Grundsatz</dt><dd>Freiheit im Beitrag, Verantwortung in der Wirkung.</dd></div></dl></aside></div><p class="narrative-disclaimer">${SAG.disclaimer}</p></div>`;
    bindDialogue();document.getElementById('narrativeReplayIntro')?.addEventListener('click',()=>{sessionStorage.setItem('sag-replay-intro','1');location.replace(`sprint25.html?build=0250&replay=${Date.now()}`)});document.getElementById('narrativeReducedMotion')?.addEventListener('change',event=>{App.saveStory({...App.story,reducedMotion:event.target.checked});document.body.classList.toggle('sag-reduced-motion',event.target.checked)});document.getElementById('narrativeFinale')?.addEventListener('click',()=>App.showFinale?.(story,true));
  }

  function rewriteIntro(){
    const copies=[
      ['PROLOG // GALIA EXPANSE','DER FRIEDEN IST KEINE LEERE','Der Convergence War brachte MUD, ONI und Ustur an den Rand des Zusammenbruchs. Der Council of Peace beendete den Krieg – nicht die Ursachen, die ihn möglich machten.'],
      ['MUD // ONI // USTUR','DREI FRAKTIONEN. DREI WAHRHEITEN.','Menschliche Industrie, außerirdische Vielfalt und künstliche Erkenntnissuche halten Galia gemeinsam am Leben. Keine Perspektive genügt allein.'],
      ['STARPATH // OUTER ZONES','DIE FRONTIER ÖFFNET SICH ERNEUT','Während die Kernsysteme prosperieren, bleiben frühere Kolonien und Hochrisikozonen außerhalb stabiler Ordnung. Eine neue Generation von DACs kehrt zurück.'],
      ['STAR ATLAS GERMANY // SEIT 2022','SAG IST KEINE VIERTE FRAKTION','Kiwimi gründete eine eigenständige deutschsprachige DAC: multifraktional, friedlich ausgerichtet und offen für Mitglieder, die Freiheit mit Verantwortung verbinden.'],
      ['DEIN AUFNAHMEWEG','BAUE DEINEN PLATZ AUF','Wähle deine Herkunft. Lerne aus Galias Geschichte. Teile Wissen, halte Zusagen und entscheide, welchen Wert du für eine gemeinsame Crew schaffen willst.']
    ];
    document.querySelectorAll('.sag-intro-scene').forEach((scene,index)=>{
      const copy=scene.querySelector('.sag-intro-copy'),data=copies[index];
      if(!copy||!data)return;
      const next=`<span>${data[0]}</span><h2>${data[1]}</h2><p>${data[2]}</p>`;
      if(copy.innerHTML!==next)copy.innerHTML=next;
    });
    const factionHead=document.querySelector('.sag-faction-head p');
    const factionCopy='Deine Fraktion ist dauerhaft Teil deiner Identität. SAG ist eine eigenständige multifraktionale DAC und verlangt nicht, diese Herkunft abzulegen.';
    if(factionHead&&factionHead.textContent!==factionCopy)factionHead.textContent=factionCopy;
  }
  let introRewriteScheduled=false;
  function scheduleIntroRewrite(){
    if(introRewriteScheduled)return;
    introRewriteScheduled=true;
    requestAnimationFrame(()=>{introRewriteScheduled=false;rewriteIntro()});
  }
  function install(){
    if(installed)return;installed=true;App.registerTab('home',renderHome);App.registerTab('campaign',renderCampaign);App.registerTab('lore',renderLore);App.registerTab('profile',renderProfile);App.renderHome=renderHome;App.renderCampaign=renderCampaign;App.refreshCampaign=()=>{if(!document.getElementById('sagStoryShell')?.classList.contains('sag-hidden')&&document.querySelector('[data-sag-tab="campaign"]')?.classList.contains('active'))renderCampaign()};App.replayIntro=()=>{sessionStorage.setItem('sag-replay-intro','1');location.replace(`sprint25.html?build=0250&replay=${Date.now()}`)};rewriteIntro();const introRoot=document.getElementById('sagIntro');if(introRoot)new MutationObserver(scheduleIntroRewrite).observe(introRoot,{childList:true,subtree:true});window.SAG25_NARRATIVE={version:'0.25',installed:true};const active=document.querySelector('#sagStoryTabs button.active')?.dataset.sagTab||'home';if(!document.getElementById('sagStoryShell')?.classList.contains('sag-hidden'))App.setTab(active==='admission'?'profile':active);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,25),{once:true});else setTimeout(install,25);
})();