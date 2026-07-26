(()=>{
  'use strict';
  const App=window.SAGRecruitment,Core=window.SAGStoryCore,Content=window.SAG25Content;
  if(!App||!Core||!Content)throw new Error('Sprint 24 dialogue dependencies missing');

  const factionName=()=>App.story.faction?Core.FACTIONS[App.story.faction].name:'keine Fraktion';
  const factionReply={
    mud:'MUD kann Versorgung, Fertigung und belastbare Infrastruktur einbringen. Aber industrielle Stärke wird gefährlich, wenn Geschwindigkeit wichtiger wird als Folgen.',
    oni:'ONI zeigt, dass sehr unterschiedliche Spezies gemeinsame Interessen organisieren können. Vielfalt allein löst jedoch keinen Konflikt; sie braucht Übersetzung und Geduld.',
    ustur:'Ustur erinnern uns daran, dass Identität nicht an Biologie gebunden ist. Ihre Suche nach Erkenntnis ist wertvoll, solange Analyse nicht zum Ersatz für Mitgefühl wird.'
  };

  const dialogues={
    origin:{
      kicker:'GESPRÄCH 01 // HERKUNFT',title:'Was bedeutet meine Fraktion für SAG?',prompt:()=>`Du fliegst als ${factionName()}. Kiwimi öffnet die Akte deiner Fraktion, schließt sie aber wieder, bevor er antwortet.`,
      choices:[
        {label:'Muss SAG wirklich multifraktional sein?',response:()=>`Ja. Der Convergence War zeigt, wohin getrennte Lagebilder führen können. SAG ist keine vierte Fraktion. Wir schaffen einen Raum, in dem ${factionName()}-Piloten mit anderen arbeiten können, ohne ihre Herkunft zu verstecken.`},
        {label:'Was erwartest du konkret von meiner Fraktion?',response:()=>factionReply[App.story.faction]||'Wähle zuerst eine Herkunft. Danach können wir über ihre Stärken und blinden Flecken sprechen.'},
        {label:'Soll ich im Zweifel SAG oder meiner Fraktion folgen?',response:()=>`Eine ehrliche Frage hat keine bequeme Standardantwort. SAG verlangt keine geheime Doppelidentität. Lege Interessen offen, trenne persönliche Loyalität vom gemeinsamen Auftrag und akzeptiere, dass du bei einem echten Konflikt Position beziehen musst.`}
      ]
    },
    war:{
      kicker:'GESPRÄCH 02 // KONVERGENZ',title:'Warum beginnt die Kampagne bei Iris?',prompt:()=>`Kiwimi projiziert eine Karte des Cataclysm. Sie zeigt Messdaten, aber keine Besitzgrenzen.`,
      choices:[
        {label:'War Iris nur eine Ressource?',response:()=>`Nein. Iris war ein Planet, eine Energieanomalie, ein wissenschaftliches Rätsel und vermutlich für die Tufa etwas Heiliges. Das Problem begann, als die Fraktionen all diese Bedeutungen auf einen Besitzanspruch reduzierten.`},
        {label:'Könnte derselbe Krieg wieder beginnen?',response:()=>`Nicht auf dieselbe Weise. Aber der Druck steigt: neue DACs, alte Kolonien, knappe Ressourcen und Generationen ohne eigene Erinnerung an den Krieg. Geschichte wiederholt sich selten exakt. Ihre Ausreden tun es häufiger.`},
        {label:'Was soll SAG anders machen?',response:()=>`Funde dokumentieren, Unsicherheit benennen, Betroffene berücksichtigen und Kooperation vor Verwertung prüfen. Das klingt langsamer. Ein galaktischer Krieg war deutlich langsamer.`}
      ]
    },
    frontier:{
      kicker:'GESPRÄCH 03 // AUSSENZONEN',title:'Wem gehört die Frontier?',prompt:()=>`Auf der Karte enden die hellen StarPath-Linien. Dahinter beginnen einzelne Signale, alte Kolonien und unklare Herrschaftsräume.`,
      choices:[
        {label:'Wer zuerst kommt, kontrolliert die Route.',response:()=>`Kontrolle ist eine Tatsache, keine moralische Begründung. Du kannst eine Route sichern und trotzdem anerkennen, dass dort bereits Menschen, Spezies oder Strukturen existieren. SAG soll Infrastruktur schaffen, nicht Geschichte ausradieren.`},
        {label:'Sollten wir Jorvik und ECOS grundsätzlich bekämpfen?',response:()=>`Wir bekämpfen konkrete Bedrohungen. Jorvik steht für Piraterie; ECOS kann mit radikalen Eingriffen ganze Welten gefährden. Trotzdem ersetzt ein Etikett keine Lagebeurteilung. Erst identifizieren, dann entscheiden.`},
        {label:'Warum schicken wir überhaupt Piloten dorthin?',response:()=>`Weil Rückzug ebenfalls Folgen hat. Verlassene Räume werden nicht neutral. Sie werden von denen geprägt, die bereit sind, Verantwortung oder Macht zu übernehmen. Ich möchte, dass SAG den Unterschied kennt.`}
      ]
    },
    dac:{
      kicker:'GESPRÄCH 04 // EIGENSTÄNDIGE DAC',title:'Was ist SAG – und was nicht?',prompt:()=>`Kiwimi zeigt das SAG-Zeichen neben den Emblemen der drei Fraktionen, aber niemals darüber.`,
      choices:[
        {label:'Ist SAG Teil des Council of Peace?',response:()=>`Nein. SAG ist eine eigenständige, von Spielern aufgebaute DAC und keine offizielle Institution des Council of Peace, von Star Atlas oder ATMTA. Im Spiel suchen wir legitime Beziehungen zu diesen Strukturen, aber wir sprechen nicht für sie.`},
        {label:'Wer entscheidet bei SAG?',response:()=>`Idealerweise die Menschen, die Verantwortung und Fachwissen zusammenbringen. Karrierebereiche und Fraktionsvertretungen beraten im gemeinsamen Rat. Konsens ist das Ziel; Abstimmung ist das Werkzeug, wenn Konsens nicht möglich ist.`},
        {label:'Wie frei bin ich als Mitglied?',response:()=>`Sehr frei. Du kannst deinen Karriereweg, deinen Beitrag und eigene Initiativen wählen. Diese Freiheit endet dort, wo du andere täuschst, ihre Sicherheit gefährdest oder im Namen von SAG Konflikte provozierst.`},
        {label:'Warum überhaupt Mitglied werden?',response:()=>`Weil große Expeditionen, Lieferketten, Wissen und politische Wirkung Koordination brauchen. Nicht jeder muss Mitglied sein. Unsere öffentliche Community bleibt auch für Solospieler und andere DACs offen.`}
      ]
    },
    admission:{
      kicker:'GESPRÄCH 05 // AUFNAHME',title:'Was prüfst du wirklich?',prompt:()=>`Das Dossier zeigt Abschüsse, Entdeckungen und Verträge. Kiwimi minimiert die Zahlen und lässt nur deine Entscheidungen stehen.`,
      choices:[
        {label:'Reicht meine Leistung noch nicht?',response:()=>`Leistung öffnet Möglichkeiten. Sie beantwortet nicht, was du mit ihnen machst. Ich prüfe, ob andere Piloten durch deine Anwesenheit handlungsfähiger werden – nicht, ob du jede Statistik maximiert hast.`},
        {label:'Muss ich dir loyal sein?',response:()=>`Nicht mir. Loyalität zu einer Person ist zu fragil für eine DAC. Sei loyal zur Charta, zu ehrlichen Zusagen und zu den Menschen, die sich auf dich verlassen. Widersprich mir, wenn du es begründen kannst.`},
        {label:'Was passiert nach der Aufnahme?',response:()=>`Dann endet die bequeme Rolle des Bewerbers. Du kannst Wissen weitergeben, Crews unterstützen, ein Unternehmen aufbauen oder Verantwortung im Rat übernehmen. Mitgliedschaft ist der Anfang deines Beitrags.`}
      ]
    },
    member:{
      kicker:'MITGLIEDSKANAL // NACH DER AUFNAHME',title:'Was erwartet SAG jetzt von mir?',prompt:()=>`Dein Status ist bestätigt. Kiwimi spricht nicht feierlicher als zuvor.`,
      choices:[
        {label:'Welchen Karriereweg soll ich wählen?',response:()=>`Den, den du langfristig tragen kannst. Rohstoffe, Ingenieurswesen, Logistik, Verteidigung und Sonderoperationen brauchen unterschiedliche Menschen. Wähle nicht die prestigeträchtigste Rolle, sondern die, in der du zuverlässig wirst.`},
        {label:'Wie helfe ich neuen Mitgliedern?',response:()=>`Erkläre Zusammenhänge, nicht nur Klickfolgen. Teile Fehler, nicht nur Erfolge. Und gib ihnen Raum, bessere Entscheidungen zu treffen als wir.`},
        {label:'Wann bin ich bereit für Führung?',response:()=>`Wenn du Verantwortung übernimmst, bevor du Autorität verlangst. Eine Position bestätigt dann nur noch, was andere bereits in deinem Verhalten sehen.`}
      ]
    }
  };

  function topicForState(){if(App.story.admitted)return'member';return['origin','war','frontier','dac','admission'][Math.max(0,Math.min(4,(App.story.chapter||1)-1))]}
  function ensureOverlay(){
    let overlay=document.getElementById('sagDialogue');
    if(overlay)return overlay;
    overlay=document.createElement('section');overlay.id='sagDialogue';overlay.className='sag-dialogue sag-hidden';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','sagDialogueTitle');document.body.append(overlay);
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
    addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.classList.contains('sag-hidden'))close()});
    return overlay;
  }
  function markConversation(id){
    const marker=`dialogue:${id}`,seen=App.story.seenScenes||[];
    if(seen.includes(marker))return false;
    App.saveStory({...App.story,kiwimiTrust:App.story.kiwimiTrust+1,seenScenes:[...seen,marker]});
    return true;
  }
  function open(id=topicForState()){
    const dialogue=dialogues[id]||dialogues.origin,overlay=ensureOverlay();
    overlay.classList.remove('sag-hidden');document.body.style.overflow='hidden';
    overlay.innerHTML=`<article class="sag-dialogue-panel"><header><div class="sag-dialogue-portrait" aria-hidden="true"></div><div><span>${dialogue.kicker}</span><h2 id="sagDialogueTitle">${dialogue.title}</h2><p>${dialogue.prompt()}</p></div><button class="sag-dialogue-close" type="button" aria-label="Gespräch schließen">×</button></header><div class="sag-dialogue-choices"></div></article>`;
    const choices=overlay.querySelector('.sag-dialogue-choices');
    dialogue.choices.forEach((choice,index)=>{const button=document.createElement('button');button.type='button';button.innerHTML=`<b>${String(index+1).padStart(2,'0')}</b><span>${choice.label}</span>`;button.addEventListener('click',()=>answer(id,choice));choices.append(button)});
    overlay.querySelector('.sag-dialogue-close').addEventListener('click',close);
  }
  function answer(id,choice){
    const overlay=ensureOverlay(),gained=markConversation(id);
    overlay.querySelector('.sag-dialogue-panel').innerHTML=`<header><div class="sag-dialogue-portrait" aria-hidden="true"></div><div><span>KIWIMI // ANTWORT</span><h2 id="sagDialogueTitle">${choice.label}</h2></div><button class="sag-dialogue-close" type="button" aria-label="Gespräch schließen">×</button></header><div class="sag-dialogue-answer"><p>${choice.response()}</p>${gained?'<small>Erstes vollständiges Gespräch: +1 Kiwimi-Vertrauen</small>':''}<div><button class="sag-btn" data-dialogue-back type="button">Weitere Frage</button><button class="sag-btn primary" data-dialogue-close type="button">Gespräch beenden</button></div></div>`;
    overlay.querySelector('.sag-dialogue-close').addEventListener('click',close);overlay.querySelector('[data-dialogue-back]').addEventListener('click',()=>open(id));overlay.querySelector('[data-dialogue-close]').addEventListener('click',close);
  }
  function close(){const overlay=document.getElementById('sagDialogue');if(overlay)overlay.classList.add('sag-hidden');document.body.style.overflow=document.getElementById('sagStoryShell')?.classList.contains('sag-hidden')?'':'hidden'}

  window.SAGDialogue={open,close,topicForState,dialogues,version:24};
})();