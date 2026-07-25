(()=>{
  'use strict';
  const App=window.SAGRecruitment,Core=window.SAGStoryCore;
  if(!App||!Core)throw new Error('Narrative polish dependencies missing');

  const intro=[
    {kicker:'VOR 2523 // IRIS UND DER CATACLYSM',title:'DER REICHTUM, DER GALIA ZERRISS',text:'Iris kollidierte mit sieben Planeten. Seltene Materialien und freie Energie lockten MUD, ONI und Ustur an denselben Rand des Cataclysm.',source:'STAR ATLAS KANON'},
    {kicker:'DER CONVERGENCE WAR',title:'DREI FRAKTIONEN. EIN FAST VERLORENES UNIVERSUM.',text:'Stolz, Gier und Misstrauen machten aus einer Entdeckung einen galaktischen Krieg. Welten fielen, Handelswege brachen und ganze Spezies standen vor dem Ende.',source:'STAR ATLAS KANON'},
    {kicker:'2523 // COUNCIL OF PEACE',title:'FRIEDEN IST EIN SYSTEM, KEIN ZUSTAND.',text:'Der Friedensvertrag verband die drei Fraktionen. StarPath, gemeinsame Regeln und Handel heilten Galia – doch jenseits der sicheren Zonen blieb ein Machtvakuum zurück.',source:'STAR ATLAS KANON'},
    {kicker:'STAR ATLAS GERMANY // EIGENE DAC',title:'UNTER EIGENER FLAGGE.',text:'Kiwimi führt eine unabhängige deutschsprachige DAC über alle drei Fraktionen hinweg. SAG ist weder ATMTA noch eine offizielle Organisation von Star Atlas.',source:'SAG DAC'},
    {kicker:'SAG FRONTIER // DEINE BEWERBUNG',title:'HERKUNFT WÄHLEN. VERANTWORTUNG VERDIENEN.',text:'Folge dem Echo von Iris, schütze die äußeren Korridore und entscheide, welche Art von Mitglied du für eine freie Gemeinschaft sein willst.',source:'SAG FRONTIER FIKTION'}
  ];
  const kiwimiLines={
    1:['„Der Frieden von Galia ist älter als deine Karriere, aber jünger als die Wunden, die er schützen soll.“','Lerne zuerst, wo deine Fraktion endet und deine eigene Verantwortung beginnt.'],
    2:['„Ruinen sind keine leeren Räume. Sie sind Entscheidungen, deren Folgen noch niemand abgeschlossen hat.“','Bring nicht nur Ressourcen zurück. Bring ein verständliches Lagebild zurück.'],
    3:['„Iris hat schon einmal bewiesen, wie schnell Neugier zu Besitzanspruch werden kann.“','Folge dem Echo, aber verwechsle Entdeckung nicht mit Eigentum.'],
    4:['„SAG ist unabhängig. Deshalb können wir niemanden für unsere Fehler verantwortlich machen.“','Lies die Charta nicht als Regeln für andere, sondern als Grenze für dein eigenes Handeln.'],
    5:['„Ein Tag im Namen ist leicht. Ein Name, dem andere vertrauen, ist schwer.“','Die Aufnahme entscheidet, ob du SAG tragen kannst, ohne andere kleiner zu machen.']
  };

  function polishIntro(){
    const scenes=document.querySelectorAll('.sag-intro-scene');if(scenes.length!==intro.length)return;
    scenes.forEach((scene,index)=>{if(scene.dataset.narrative025==='1')return;const data=intro[index],copy=scene.querySelector('.sag-intro-copy');if(!copy)return;copy.querySelector('span').textContent=data.kicker;copy.querySelector('h2').textContent=data.title;copy.querySelector('p').textContent=data.text;const source=document.createElement('small');source.className='sag-intro-source';source.textContent=data.source;copy.append(source);scene.dataset.narrative025='1';});
  }
  function scopeClass(scope=''){if(scope.includes('KANON'))return'canon';if(scope.includes('SAG DAC'))return'sag';return'fiction'}
  function decorateLore(){
    const page=document.querySelector('.focus-page #focusLoreReader');if(!page)return;
    const activeTitle=document.querySelector('#focusLoreList button.active')?.textContent?.trim(),entry=Core.LORE.find(item=>item.title===activeTitle);if(!entry)return;
    const kicker=page.querySelector('.focus-kicker');if(kicker&&!page.querySelector('.sag-lore-scope')){const scope=document.createElement('span');scope.className='sag-lore-scope';scope.textContent=entry.scope||'SAG FRONTIER FIKTION';kicker.after(scope)}
    if(!page.querySelector('.sag-lore-disclaimer')){const note=document.createElement('div');note.className='sag-lore-disclaimer';note.textContent=entry.scope==='STAR ATLAS KANON'?'Dieser Eintrag fasst offiziellen Star-Atlas-Kanon zusammen.':'Dieser Eintrag stammt aus SAG-Unterlagen oder wurde für SAG Frontier geschrieben und ist kein offizieller Star-Atlas-Kanon.';page.append(note)}
    const header=document.querySelector('.focus-page .focus-header');if(header&&!header.querySelector('.sag-source-legend')){const legend=document.createElement('div');legend.className='sag-source-legend';legend.innerHTML='<span class="sag-source-badge canon">STAR ATLAS KANON</span><span class="sag-source-badge sag">SAG DAC</span><span class="sag-source-badge fiction">KAMPAGNENFIKTION</span>';header.append(legend)}
  }
  function polishHome(){
    const card=document.querySelector('.focus-kiwimi');if(!card)return;const chapter=Math.max(1,Math.min(5,App.story.chapter||1)),line=kiwimiLines[chapter];if(!line)return;
    const heading=card.querySelector('h3'),paragraph=card.querySelector('p');if(heading)heading.textContent=App.story.admitted?'„Aus Aufnahme wird Verantwortung.“':line[0];if(paragraph)paragraph.textContent=App.story.admitted?'Du bist Teil der unabhängigen SAG-DAC. Ab jetzt wird dein Verhalten für neue Anwärter selbst zu einem Teil der Geschichte.':line[1];if(!card.querySelector('.sag-kiwimi-origin')){const origin=document.createElement('small');origin.className='sag-kiwimi-origin';origin.textContent='Kiwimi ist die zentrale Gründerfigur dieser Kampagne. SAG bleibt organisatorisch unabhängig von Star Atlas und ATMTA.';card.append(origin)}
  }
  function polishFooter(){const footer=document.querySelector('.sag-hq-footer');if(!footer||footer.querySelector('.sag-canon-note'))return;const note=document.createElement('span');note.className='sag-canon-note';note.textContent='KANON · SAG DAC · FIKTION GETRENNT';footer.insertBefore(note,footer.lastElementChild)}
  function run(){polishIntro();decorateLore();polishHome();polishFooter()}
  const targets=[document.getElementById('sagIntro'),document.getElementById('sagStoryContent'),document.getElementById('sagStoryShell')].filter(Boolean);targets.forEach(target=>new MutationObserver(()=>queueMicrotask(run)).observe(target,{childList:true,subtree:true,attributes:true,attributeFilter:['class']}));
  document.addEventListener('click',event=>{const replay=event.target.closest('#focusReplayIntro');if(!replay)return;event.preventDefault();event.stopImmediatePropagation();sessionStorage.setItem('sag-replay-intro','1');location.replace(`sprint25.html?build=0250&replay=${Date.now()}`)},true);
  App.replayIntro=()=>{sessionStorage.setItem('sag-replay-intro','1');location.replace(`sprint25.html?build=0250&replay=${Date.now()}`)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
  window.SAG25_NARRATIVE={version:'0.25',sprints:[21,22,23,24,25],sources:['STAR ATLAS KANON','SAG DAC','SAG FRONTIER FIKTION']};
})();