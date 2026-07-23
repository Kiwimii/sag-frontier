(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const copy = {
    de: {
      deepKicker: 'PROZEDURALER TIEFENRAUM',
      deepHeading: 'Die Karte endet nicht mehr am Bildschirmrand',
      deepDescription: 'Fliege in jede Richtung, erschließe neue Raumsektoren und entdecke Ressourcen-Asteroiden sowie verlassene Stationen. Aktive Chunk-Streams halten die Welt auch auf Mobilgeräten stabil.',
      record: 'BESTE DISTANZ', discoveries: 'ENTDECKUNGEN', loop: ['ERKUNDEN','ENTDECKEN','BERGEN','AUFRÜSTEN'],
      weaponNote: 'Jede Waffe besitzt eine eigene Rolle, Entwicklung und sichtbare Waffen-Evolution.',
      shipNote: 'Jedes Schiff besitzt eine eigene Silhouette, Werteverteilung und aktive Schiffspassive.',
      moduleNote: 'Module verändern nicht nur Werte, sondern aktivieren eigene Synergien im Einsatz.',
      skillNote: 'Drei Entwicklungszweige mit echten Voraussetzungen. Höhere Knoten werden erst über ihre Vorgänger freigeschaltet.',
      context: 'DEEP-SPACE-NAVIGATION', title: 'Der Raum reagiert auf deine Route.', message: 'Nutze Radar und Zielkompass. Stationen belohnen kontrolliertes Scannen, Ressourcen-Asteroiden belohnen Feuerkraft und Positionierung.'
    },
    en: {
      deepKicker: 'PROCEDURAL DEEP SPACE',
      deepHeading: 'The map no longer ends at the viewport',
      deepDescription: 'Fly in any direction, open new regions, and discover resource asteroids and abandoned stations. Active chunk streaming keeps the world stable on mobile devices.',
      record: 'BEST DISTANCE', discoveries: 'DISCOVERIES', loop: ['EXPLORE','DISCOVER','SALVAGE','UPGRADE'],
      weaponNote: 'Every weapon has a distinct role, progression path, and visible weapon evolution.',
      shipNote: 'Every ship has a distinct silhouette, stat profile, and active ship passive.',
      moduleNote: 'Modules do more than change values: they activate dedicated deployment synergies.',
      skillNote: 'Three progression branches with real prerequisites. Higher nodes unlock only through their predecessors.',
      context: 'DEEP SPACE NAVIGATION', title: 'Space responds to your route.', message: 'Use radar and the target compass. Stations reward controlled scanning; resource asteroids reward firepower and positioning.'
    }
  };
  const language = () => document.documentElement.lang === 'en' || $('langEn')?.classList.contains('active') ? 'en' : 'de';
  const set = (id, value) => { const node = $(id); if (node) node.textContent = value; };
  function apply() {
    const q = copy[language()];
    set('deepSpaceKicker', q.deepKicker); set('deepSpaceHeading', q.deepHeading); set('deepSpaceDescription', q.deepDescription);
    set('explorationRecordLabel', q.record); set('discoveryRecordLabel', q.discoveries);
    q.loop.forEach((value, index) => set(`exploreLoop${index + 1}`, value));
    set('weaponsSectionNote', q.weaponNote); set('shipsSectionNote', q.shipNote); set('modulesSectionNote', q.moduleNote); set('skillTreeNote', q.skillNote);
    if ($('tabDeployment')?.classList.contains('active')) {
      set('kiwimiContext', q.context); set('kiwimiTitle', q.title); set('kiwimiMessage', q.message);
    }
  }
  for (const id of ['langDe','langEn']) $(id)?.addEventListener('click', () => requestAnimationFrame(() => requestAnimationFrame(apply)));
  $('tabDeployment')?.addEventListener('click', () => requestAnimationFrame(() => requestAnimationFrame(apply)));
  apply();
})();
