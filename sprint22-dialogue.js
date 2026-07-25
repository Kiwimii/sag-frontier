(()=>{
  'use strict';
  const App=window.SAGRecruitment,Core=window.SAGStoryCore;
  if(!App||!Core)throw new Error('Dialogue dependencies missing');

  const dialogues={
    1:{
      title:'Warum drei Fraktionen?',
      line:'Der Council of Peace hat den Krieg beendet, aber er hat die Unterschiede nicht gelöscht. SAG soll sie auch nicht löschen. Eine multifraktionale DAC funktioniert nur, wenn Herkunft sichtbar bleibt und trotzdem nicht über Zusammenarbeit entscheidet.',
      context:'Star-Atlas-Kanon: Council of Peace und drei Fraktionen. SAG-Perspektive: freiwillige Zusammenarbeit unter eigener Flagge.',
      choices:[
        {id:'unity',label:'„Dann ist SAG eine Brücke.“',hint:'Du betonst Verbindung und Diplomatie.',reply:'Eine Brücke gehört keiner Seite allein. Sie ist nur dann wertvoll, wenn Menschen sie tatsächlich benutzen und instand halten. Genau das will ich von dir sehen.',trust:2,flag:'bridge'},
        {id:'identity',label:'„Meine Fraktion bleibt zuerst.“',hint:'Du verlangst eine klare Grenze zwischen Herkunft und DAC.',reply:'Das ist legitim. SAG verlangt keine Aufgabe deiner Identität. Aber sobald du unseren Namen trägst, musst du erklären können, wo Fraktionsinteresse endet und gemeinsame Verantwortung beginnt.',trust:1,flag:'identity'}
      ]
    },
    2:{
      title:'Was schulden wir den verlassenen Welten?',
      line:'Nach dem Convergence War zogen sich die großen Fraktionen aus vielen Kolonien zurück. Manche nennen das Wiederaufbau. Andere nennen es Aufgabe. Eine DAC wie SAG kann nicht jede Welt retten. Aber wir dürfen auch nicht so tun, als hätten Ruinen keine Geschichte.',
      context:'Star-Atlas-Kanon: Rückzug aus Medium- und High-Risk-Kolonien. SAG-Frage: Wie weit reicht freiwillige Verantwortung?',
      choices:[
        {id:'rescue',label:'„Menschen zuerst, Beute danach.“',hint:'Du stellst Rettung und Schutz in den Mittelpunkt.',reply:'Dann wirst du manchmal mit weniger Credits zurückkehren. Dafür wissen andere Crews, dass dein Signal etwas bedeutet. Vertrauen entsteht genau dort.',trust:2,flag:'rescue'},
        {id:'sustain',label:'„Nur helfen, wenn wir es tragen können.“',hint:'Du priorisierst nachhaltige Einsatzfähigkeit.',reply:'Auch das ist Verantwortung. Wer jede Notlage annimmt und dabei die eigene Crew verliert, hilft am Ende niemandem. Entscheidend ist, dass du Grenzen ehrlich benennst.',trust:2,flag:'sustain'}
      ]
    },
    3:{
      title:'Warum dem Echo folgen?',
      line:'Iris hat schon einmal drei Zivilisationen gegeneinander getrieben. Das Echo kann ein Archiv sein, eine Falle oder nur ein beschädigtes System. Wir folgen ihm nicht, weil es wertvoll klingt. Wir folgen ihm, weil Unwissen in Galia schon einmal einen Krieg ausgelöst hat.',
      context:'Star-Atlas-Kanon: Iris und der Cataclysm als Auslöser des Convergence War. SAG-Fiktion: das reagierende Echo.',
      choices:[
        {id:'knowledge',label:'„Verstehen, bevor wir handeln.“',hint:'Du entscheidest dich für Datensicherung und Analyse.',reply:'Gut. Geschwindigkeit beeindruckt. Ein belastbares Lagebild schützt. Im Command Network zählt nicht, wer zuerst eine Vermutung hatte, sondern wer sie prüfen konnte.',trust:2,flag:'knowledge'},
        {id:'contain',label:'„Gefahr zuerst begrenzen.“',hint:'Du bevorzugst kontrollierte Eindämmung.',reply:'Dann musst du diszipliniert bleiben. Eindämmung darf nicht zur Ausrede werden, jedes Unbekannte zu vernichten. Der Cataclysm ist gefährlich, aber nicht alles dort ist unser Feind.',trust:1,flag:'contain'}
      ]
    },
    4:{
      title:'Warum eine eigene DAC?',
      line:'SAG ist nicht der Council of Peace, keine Fraktion und kein offizieller Arm von Star Atlas. Wir sind eine selbstorganisierte Gemeinschaft. Das gibt uns Freiheit, aber keine automatische Legitimität. Jeder Einsatz entscheidet neu, ob unser Name Vertrauen verdient.',
      context:'SAG-Whitepaper: eigenständige, community-getriebene und multifraktionale DAC; keine Verbindung zu ATMTA oder Star Atlas als Organisation.',
      choices:[
        {id:'freedom',label:'„Freiheit braucht Eigenverantwortung.“',hint:'Du stellst Selbstbestimmung und Rechenschaft zusammen.',reply:'Genau. Freiheit ohne Rechenschaft wird Willkür. Regeln ohne Freiheit werden Verwaltung. SAG muss zwischen beidem beweglich bleiben.',trust:3,flag:'freedom'},
        {id:'structure',label:'„Eine DAC braucht klare Führung.“',hint:'Du betonst verlässliche Zuständigkeiten.',reply:'Ja. Aber Führung muss begründbar bleiben. Kompetenz, Vertrauen und überprüfbare Entscheidungen sind stärker als ein Titel allein.',trust:2,flag:'structure'}
      ]
    },
    5:{
      title:'Was bedeutet Aufnahme?',
      line:'Ein SAG-Tag ist keine Auszeichnung für einen starken Einzelspieler. Es ist ein öffentliches Versprechen: Du behandelst andere respektvoll, schützt Daten, provozierst keine Konflikte im Namen der DAC und hilfst neuen Piloten, ihren eigenen Platz zu finden.',
      context:'SAG-Werte: Integrität, Respekt, Datenschutz, Solidarität, Friedensorientierung, Eigenverantwortung, Mentoring und Weitblick.',
      choices:[
        {id:'mentor',label:'„Ich gebe Wissen weiter.“',hint:'Du verstehst Mitgliedschaft als Mentorenrolle.',reply:'Dann beginnt deine eigentliche Aufgabe erst nach der Aufnahme. Eine starke DAC misst sich daran, wie schnell neue Mitglieder selbstständig werden.',trust:3,flag:'mentor'},
        {id:'represent',label:'„Ich vertrete SAG bewusst.“',hint:'Du betonst Wirkung und Außenverantwortung.',reply:'Dann denke daran: Andere sehen zuerst dein Verhalten und erst danach unsere Charta. Du wirst nicht nur an deinen Erfolgen gemessen, sondern an dem Raum, den du für andere lässt.',trust:3,flag:'represent'}
      ]
    }
  };

  function history(){const value=App.story.dialogueHistory;return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}
  function activeChapter(){return Math.max(1,Math.min(5,App.story.chapter||1))}
  function factionContext(){const faction=App.story.faction&&Core.FACTIONS[App.story.faction];if(!faction)return'Deine Fraktion ist noch nicht registriert.';return `${faction.name}: ${faction.voice||faction.title}.`}
  function ensureOverlay(){
    let overlay=document.getElementById('sagDialogueOverlay');
    if(overlay)return overlay;
    overlay=document.createElement('section');overlay.id='sagDialogueOverlay';overlay.className='sag-dialogue-overlay sag-hidden';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','sagDialogueTitle');document.body.append(overlay);return overlay;
  }
  function close(){const overlay=document.getElementById('sagDialogueOverlay');if(overlay){overlay.classList.add('sag-hidden');overlay.innerHTML='';}}
  function open(chapter=activeChapter()){
    const dialogue=dialogues[chapter]||dialogues[1],done=history()[String(chapter)],overlay=ensureOverlay();
    overlay.classList.remove('sag-hidden');
    overlay.innerHTML=`<article class="sag-dialogue-panel"><header class="sag-dialogue-head"><div class="sag-dialogue-portrait"></div><div><span>KIWIMI // GRÜNDERKANAL</span><h2 id="sagDialogueTitle">${dialogue.title}</h2></div><button class="sag-dialogue-close" type="button" aria-label="Dialog schließen">×</button></header><div class="sag-dialogue-body"><span class="sag-dialogue-speaker">KIWIMI</span><p class="sag-dialogue-line">${dialogue.line}</p><div class="sag-dialogue-context">${dialogue.context}<br>${factionContext()}</div><div id="sagDialogueChoices" class="sag-dialogue-choices"></div><div id="sagDialogueResult"></div></div></article>`;
    overlay.querySelector('.sag-dialogue-close')?.addEventListener('click',close);
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()},{once:true});
    if(done){showResult(dialogue,dialogue.choices.find(choice=>choice.id===done.choice)||dialogue.choices[0],true);return;}
    const holder=overlay.querySelector('#sagDialogueChoices');dialogue.choices.forEach(choice=>{const button=document.createElement('button');button.type='button';button.className='sag-dialogue-choice';button.innerHTML=`<b>${choice.label}</b><span>${choice.hint}</span>`;button.addEventListener('click',()=>choose(chapter,dialogue,choice));holder.append(button)});
  }
  function choose(chapter,dialogue,choice){
    const previous=history();if(previous[String(chapter)]){showResult(dialogue,choice,true);return;}
    const nextHistory={...previous,[String(chapter)]:{choice:choice.id,flag:choice.flag,at:Date.now()}};
    App.saveStory({...App.story,dialogueHistory:nextHistory,kiwimiTrust:App.story.kiwimiTrust+choice.trust});
    showResult(dialogue,choice,false);App.refreshMetrics?.();
  }
  function showResult(dialogue,choice,replay){
    const choices=document.getElementById('sagDialogueChoices'),result=document.getElementById('sagDialogueResult');if(choices)choices.innerHTML='';if(!result)return;
    result.className='sag-dialogue-result';result.innerHTML=`<span class="sag-dialogue-speaker">KIWIMI</span><h3>${choice.label.replace(/[„“]/g,'')}</h3><p>${choice.reply}</p><small>${replay?'Diese Antwort ist bereits Teil deines Bewerbungsprofils.':`Entscheidung gespeichert · +${choice.trust} Vertrauen`}</small><div class="sag-dialogue-actions"><button class="sag-btn primary" type="button">ZURÜCK ZUM HQ</button></div>`;result.querySelector('button')?.addEventListener('click',close);
  }
  function injectContextButtons(){
    const homeActions=document.querySelector('.focus-page #focusCommand')?.parentElement;if(homeActions&&!homeActions.querySelector('[data-narrative="kiwimi"]')){const button=document.createElement('button');button.type='button';button.className='sag-btn narrative';button.dataset.narrative='kiwimi';button.textContent='Mit Kiwimi sprechen';homeActions.insertBefore(button,document.getElementById('focusCommand'));}
    const mission=document.querySelector('#focusMission .focus-mission');if(mission&&!mission.querySelector('[data-narrative="mission"]')){const button=document.createElement('button');button.type='button';button.className='sag-btn narrative';button.dataset.narrative='mission';button.textContent='Briefing';mission.append(button);}
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-narrative],#focusBriefing');if(!target)return;
    event.preventDefault();event.stopImmediatePropagation();open(activeChapter());
  },true);
  const content=document.getElementById('sagStoryContent');if(content)new MutationObserver(injectContextButtons).observe(content,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectContextButtons,{once:true});else injectContextButtons();
  addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('sagDialogueOverlay')?.classList.contains('sag-hidden'))close()});
  window.SAGDialogue={version:22,dialogues,open,close};
})();