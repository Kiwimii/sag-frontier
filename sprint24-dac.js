(()=>{
  'use strict';
  const App=window.SAGRecruitment,Core=window.SAGStoryCore;
  if(!App||!Core)throw new Error('SAG DAC dossier dependencies missing');

  const founder=Core.LORE.find(item=>item.id==='kiwimi-founder');
  if(founder)founder.text='Kiwimi führt als zentrale Gründerfigur durch diese Kampagne. Das SAG-Whitepaper nennt Kiwimi und LilLillith als Gründungsmitglieder. Ihr gemeinsames Ziel ist eine eigenständige deutschsprachige Gemeinschaft, in der Menschen frei Rollen übernehmen, Wissen teilen und gemeinsam Werte schaffen können.';

  const pages={
    identity:{
      label:'IDENTITÄT',title:'Eine eigene DAC in der Galia Expanse',source:'SAG-WHITEPAPER · ÖFFENTLICH GEEIGNETE GRUNDSÄTZE',
      text:'Star Atlas Germany ist im Spiel eine eigenständige Decentralized Autonomous Corporation. Sie bewegt sich innerhalb der Welt von Star Atlas, ist aber weder Teil von ATMTA noch eine offizielle Organisation von Star Atlas. Diese Unabhängigkeit ist kein Detail, sondern der Kern der SAG-Identität.',
      facts:[['Multifraktional','SAG vereint Mitglieder aus MUD, ONI und Ustur, ohne ihre Herkunft aufzulösen.'],['Friedensorientiert','SAG sucht Partnerschaften, provoziert keine Konflikte und verteidigt sich geschlossen, wenn es notwendig wird.'],['Deutschsprachig','Die gemeinsame Sprache erleichtert Wissenstransfer, Mentoring und verlässliche Zusammenarbeit.']],
      note:'Im Spiel wird kanonische Star-Atlas-Lore deshalb immer von SAG-eigenen Aussagen und frei erfundener Kampagnenhandlung getrennt.'
    },
    values:{
      label:'CHARTA',title:'Freiheit braucht einen verlässlichen Rahmen',source:'SAG-WHITEPAPER · VERHALTENSKODEX',
      text:'SAG will keine unnötigen Regeln über Mitglieder legen. Gleichzeitig kann eine freie Gemeinschaft nur bestehen, wenn Verhalten vorhersehbar und vertrauenswürdig bleibt. Die Charta verbindet deshalb Selbstbestimmung mit Verantwortung gegenüber anderen.',
      facts:[['Integrität & Respekt','Ehrlichkeit, faire Kommunikation und ein respektvoller Umgang sind nicht verhandelbar.'],['Datenschutz','Persönliche Informationen und Web3-Identitäten werden geschützt.'],['Solidarität & Mentoring','Erfahrene Mitglieder helfen neuen Piloten, selbstständig zu werden.'],['Weitblick','Ressourcen und Beziehungen werden nicht für kurzfristige Vorteile verbrannt.']],
      note:'Die Kampagne belohnt nicht jede moralisch klingende Antwort. Sie prüft, ob deine Entscheidung nachvollziehbar, tragfähig und mit den Folgen vereinbar ist.'
    },
    organization:{
      label:'ORGANISATION',title:'Fraktionen und Fachbereiche als Matrix',source:'SAG-WHITEPAPER · VEREINFACHTE ÖFFENTLICHE DARSTELLUNG',
      text:'SAG verbindet diplomatische Fraktionsvertretung mit fachlichen Karrierepfaden. Dadurch kann ein MUD-, ONI- oder Ustur-Pilot zugleich in einem spezialisierten Team Verantwortung übernehmen. Entscheidungen sollen dort vorbereitet werden, wo das nötige Wissen liegt.',
      facts:[['Rohstoffe','Mining, Verarbeitung und nachhaltige Versorgung.'],['Fertigung','Ingenieurswesen, Komponenten, Ausrüstung und Schiffe.'],['Logistik & Handel','Transportwege, Versorgung, Marktbeziehungen und Verteilung.'],['Verteidigung','Schutz von Mitgliedern, Korridoren und gemeinsamen Gütern.'],['Sonderoperationen','Exploration, Data Running, Reparatur, Rettung und weitere Spezialaufgaben.']],
      note:'Vertrauliche Treasury-, Token- und interne Governance-Details des Whitepapers sind bewusst nicht Bestandteil dieses öffentlichen Spiels.'
    },
    membership:{
      label:'MITGLIEDSCHAFT',title:'Community ist offen. Vertretung muss verdient werden.',source:'SAG-WHITEPAPER · COMMUNITY- UND MITGLIEDSCHAFTSMODELL',
      text:'Die öffentliche SAG-Community kann Interessierte, Solospieler und Mitglieder anderer DACs verbinden. Eine formelle Mitgliedschaft bedeutet darüber hinaus, SAG in der Galia Expanse zu vertreten und Verantwortung für den gemeinsamen Namen zu übernehmen.',
      facts:[['Community','Offener Austausch, Orientierung und gemeinsames Lernen ohne Verpflichtung zur DAC-Mitgliedschaft.'],['Anwärter','Lernt Charta, Geschichte und Arbeitsweise kennen und wird in Einsätzen beobachtet.'],['Mitglied','Vertritt SAG bewusst, hält die Werte ein und unterstützt die Gemeinschaft.'],['Weiterentwicklung','Fachliche Verantwortung und Führung entstehen aus Kompetenz, Engagement und Vertrauen.']],
      note:'Die Aufnahme im Spiel ist eine narrative Anerkennung innerhalb von SAG Frontier. Sie ist keine reale Mitgliedschaft und keine offizielle Bestätigung durch Star Atlas.'
    }
  };
  let active='identity';
  function ensure(){let overlay=document.getElementById('sagDacOverlay');if(overlay)return overlay;overlay=document.createElement('section');overlay.id='sagDacOverlay';overlay.className='sag-dac-overlay sag-hidden';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','sagDacTitle');document.body.append(overlay);return overlay}
  function close(){const overlay=document.getElementById('sagDacOverlay');if(overlay){overlay.classList.add('sag-hidden');overlay.innerHTML='';}}
  function open(page='identity'){active=pages[page]?page:'identity';const overlay=ensure(),data=pages[active];overlay.classList.remove('sag-hidden');overlay.innerHTML=`<article class="sag-dac-panel"><header class="sag-dac-head"><div><span>STAR ATLAS GERMANY // DAC-DOSSIER</span><h2 id="sagDacTitle">SAG unter eigener Flagge</h2></div><button class="sag-dac-close" type="button" aria-label="Dossier schließen">×</button></header><nav class="sag-dac-nav"></nav><main class="sag-dac-content"><span class="sag-dac-source">${data.source}</span><h3>${data.title}</h3><p>${data.text}</p><div class="sag-dac-facts">${data.facts.map(([label,text])=>`<article><b>${label}</b><span>${text}</span></article>`).join('')}</div><div class="sag-dac-note">${data.note}</div></main></article>`;overlay.querySelector('.sag-dac-close')?.addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close()},{once:true});const nav=overlay.querySelector('.sag-dac-nav');Object.entries(pages).forEach(([id,item])=>{const button=document.createElement('button');button.type='button';button.classList.toggle('active',id===active);button.textContent=item.label;button.addEventListener('click',()=>open(id));nav.append(button)});}
  function injectProfile(){const values=document.querySelector('.focus-profile aside.focus-card');if(!values||values.querySelector('.focus-dac-entry'))return;const section=document.createElement('section');section.className='focus-dac-entry';section.innerHTML=`<span class="focus-kicker">EIGENSTÄNDIGE DAC</span><p>SAG ist multifraktional, friedensorientiert und organisatorisch unabhängig von Star Atlas und ATMTA.</p><div class="focus-actions"><button class="sag-btn" type="button" data-open-dac>DAC-Dossier</button></div>`;values.append(section)}
  function clarifyFinale(){const panel=document.querySelector('#sagStoryScene .sag-finale-panel');if(!panel||panel.querySelector('.sag-dac-note'))return;const note=document.createElement('div');note.className='sag-dac-note';note.textContent='Diese Aufnahme gilt innerhalb der unabhängigen SAG-DAC-Kampagne. Sie ist keine offizielle Mitgliedschaft oder Bestätigung durch Star Atlas beziehungsweise ATMTA.';panel.insertBefore(note,panel.querySelector('.sag-finale-actions'))}
  document.addEventListener('click',event=>{if(event.target.closest('[data-open-dac]')){event.preventDefault();open('identity')}},true);
  const content=document.getElementById('sagStoryContent');if(content)new MutationObserver(injectProfile).observe(content,{childList:true,subtree:true});const scene=document.getElementById('sagStoryScene');if(scene)new MutationObserver(clarifyFinale).observe(scene,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('sagDacOverlay')?.classList.contains('sag-hidden'))close()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectProfile,{once:true});else injectProfile();
  window.SAGDacDossier={version:24,pages,open,close};
})();