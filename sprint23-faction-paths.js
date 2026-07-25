(()=>{
  'use strict';
  const App=window.SAGRecruitment,Core=window.SAGStoryCore;
  if(!App||!Core)throw new Error('Faction narrative dependencies missing');

  const paths={
    mud:{
      advisor:'Mara Voss',role:'SAG-Quartiermeisterin · Originalfigur dieser Kampagne',motto:'Eine Route ist erst sicher, wenn auch das letzte Versorgungsschiff zurückkehrt.',
      chapters:{
        1:'MUD liest Frieden in Lieferketten, Verträgen und funktionsfähiger Infrastruktur. Prüfe nicht nur, ob du fliegen kannst, sondern ob nach dir noch jemand fliegen kann.',
        2:'Verlassene Kolonien sind keine romantischen Ruinen. Jede Station war einmal Teil einer Versorgungskette. Suche nach dem Punkt, an dem sie gebrochen ist.',
        3:'Ein Signal ohne gesicherte Route ist nur eine teure Vermutung. Kartiere StarPath-Anschlüsse, Treibstoffpunkte und Rückwege.',
        4:'SAG braucht Freiheit, aber auch belastbare Zuständigkeiten. Wer Ressourcen verspricht, muss erklären können, wo sie herkommen.',
        5:'Vertrete MUDs industrielle Stärke, ohne SAG zu einer Beschaffungsabteilung deiner Fraktion zu machen.'
      },
      events:'MUD-Perspektive: Infrastruktur, Versorgung und überprüfbare Zusagen zuerst.'
    },
    oni:{
      advisor:'Eno Vael',role:'SAG-Archivist · Originalfigur dieser Kampagne',motto:'Eine Entdeckung gehört nicht dem Ersten, der sie sieht, sondern allen, die sie verstehen können.',
      chapters:{
        1:'ONI besteht aus vielen Spezies und Perspektiven. Dokumentiere, was du beobachtest, bevor du aus einem einzelnen Signal eine Wahrheit machst.',
        2:'Die verlassenen Welten tragen mehrere Geschichten gleichzeitig: die der Fraktionen, der Zurückgelassenen und derer, die danach kamen.',
        3:'Das Echo von Iris könnte Daten, Erinnerung oder Täuschung sein. Bewahre widersprüchliche Hypothesen, bis die Beweise sie trennen.',
        4:'Eine multifraktionale DAC ist ein lebendes Archiv. Wissen darf nicht an einzelne Personen oder Titel gebunden bleiben.',
        5:'Vertrete ONIs Neugier, ohne aus jedem unbekannten Phänomen einen Anspruch auf Besitz abzuleiten.'
      },
      events:'ONI-Perspektive: dokumentieren, vergleichen und kulturelle Folgen mitdenken.'
    },
    ustur:{
      advisor:'U-19',role:'SAG-Systemanalyst · Originalfigur dieser Kampagne',motto:'Effizienz ohne Zweck ist nur die schnelle Wiederholung eines Fehlers.',
      chapters:{
        1:'Ustur betrachtet Fraktion und DAC als überlagerte Systeme. Prüfe, welche Regeln Kooperation ermöglichen und welche nur Gewohnheit sind.',
        2:'Eine verlassene Kolonie ist ein System mit ausgefallenen Rückkopplungen. Suche nicht nur nach Feinden, sondern nach dem ursprünglichen Versagen.',
        3:'Wenn das Echo auf Entscheidungen reagiert, ist Beobachtung selbst Teil des Experiments. Verändere nie mehrere Variablen gleichzeitig.',
        4:'Autonomie verlangt transparente Entscheidungswege. Ein System, das Kritik nicht verarbeiten kann, ist nicht stabil.',
        5:'Vertrete Usturs Klarheit, ohne Empathie als ineffiziente Störung zu behandeln.'
      },
      events:'Ustur-Perspektive: Systemursachen, Wechselwirkungen und langfristige Stabilität prüfen.'
    }
  };

  Object.entries(paths).forEach(([id,path])=>Object.assign(Core.FACTIONS[id],{advisor:path.advisor,advisorRole:path.role,motto:path.motto,sagRole:path.chapters[4]}));

  function current(){return paths[App.story.faction]||null}
  function injectCampaignVoice(){
    const mission=document.getElementById('focusMission'),path=current();if(!mission||!path||mission.querySelector('.focus-faction-note'))return;
    const chapter=Math.max(1,Math.min(5,App.story.chapter||1)),note=document.createElement('aside');note.className='focus-faction-note';note.innerHTML=`<b>${Core.FACTIONS[App.story.faction].name} // ${path.advisor}</b>${path.chapters[chapter]}<br><small>${path.role}</small>`;mission.append(note);
  }
  function injectFactionCards(){
    document.querySelectorAll('.sag-faction-card').forEach(card=>{if(card.querySelector('.sag-faction-role'))return;const title=card.querySelector('h3')?.textContent?.toLowerCase(),id=title==='mud'?'mud':title==='oni'?'oni':title==='ustur'?'ustur':null,path=id&&paths[id];if(!path)return;const role=document.createElement('span');role.className='sag-faction-role';role.innerHTML=`<b>SAG-PERSPEKTIVE</b><br>${path.motto}`;card.append(role)});
  }
  function injectEventVoice(){
    const overlay=document.getElementById('sagEventOverlay'),path=current();if(!overlay||!path||overlay.classList.contains('sag-hidden')||overlay.querySelector('.sag-event-faction'))return;
    const panel=overlay.querySelector('.sag-event-panel');if(!panel)return;const note=document.createElement('div');note.className='sag-event-faction';note.innerHTML=`<b>${path.advisor}:</b> ${path.events}`;const choices=panel.querySelector('.sag-event-choices'),result=panel.querySelector('.sag-event-result');if(choices)panel.insertBefore(note,choices);else if(result)result.prepend(note);else panel.append(note);
  }
  const content=document.getElementById('sagStoryContent');if(content)new MutationObserver(injectCampaignVoice).observe(content,{childList:true,subtree:true});
  const factionStage=document.getElementById('sagFactionStage');if(factionStage)new MutationObserver(injectFactionCards).observe(factionStage,{childList:true,subtree:true});
  const eventOverlay=document.getElementById('sagEventOverlay');if(eventOverlay)new MutationObserver(injectEventVoice).observe(eventOverlay,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',event=>{if(event.target.closest('[data-sag-tab="campaign"]'))setTimeout(injectCampaignVoice,40)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{injectCampaignVoice();injectFactionCards();injectEventVoice()},{once:true});else{injectCampaignVoice();injectFactionCards();injectEventVoice()}
  window.SAGFactionNarrative={version:23,paths,current};
})();