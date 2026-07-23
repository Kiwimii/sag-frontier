(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const afterRuntime = callback => requestAnimationFrame(() => requestAnimationFrame(callback));
  const language = () => document.documentElement.lang === 'en' || $('langEn')?.classList.contains('active') ? 'en' : 'de';
  const text = {
    de: {
      sector: {
        outer: ['ÄUSSERE GRENZE', 'Gute Wahl für den Einstieg. Weniger Feinde, langsamere Projektile und ein kontrollierter Aufbau geben dir Zeit, die Systeme zu lernen.'],
        debris: ['TRÜMMERFELD', 'Hier wird das Gefecht dichter. Die Bergung steigt, aber Positionierung und Dash-Timing werden wichtiger.'],
        crimson: ['ROTE ZONE', 'Eliteverbände und hoher Druck. Dieser Sektor belohnt spezialisierte Builds und saubere Bewegungen.']
      },
      difficulty: {
        explorer: ['ERKUNDUNGSPROTOKOLL', 'Der Einsatzleiter reduziert Spitzen, garantiert frühen Support und hält ein Notsignal bereit. Fortschritt bleibt vollständig erhalten.'],
        operation: ['EINSATZPROTOKOLL', 'Ausgewogene Standardbedingungen mit normalen Belohnungen und ohne harte Anfänger-Spitzen.'],
        veteran: ['VETERANENPROTOKOLL', 'Höhere Geschwindigkeit, dichtere Wellen und stärkere Belohnungen. Nur für stabile Loadouts empfohlen.']
      },
      rank: ['PILOTENAKTE', 'Jeder Einsatz bringt Piloten-EP. Rangaufstiege liefern Credits, Tech-Kerne, Skill-Punkte und Zugang zu neuen Sektoren.']
    },
    en: {
      sector: {
        outer: ['OUTER FRONTIER', 'A strong starting choice. Fewer hostiles, slower projectiles, and a controlled curve give you time to learn the systems.'],
        debris: ['DEBRIS FIELD', 'Combat becomes denser. Salvage improves, but positioning and dash timing matter more.'],
        crimson: ['CRIMSON ZONE', 'Elite formations and sustained pressure. This sector rewards specialized builds and clean movement.']
      },
      difficulty: {
        explorer: ['EXPLORATION PROTOCOL', 'The director smooths difficulty spikes, guarantees early support, and keeps an emergency signal ready. Full progression remains active.'],
        operation: ['OPERATION PROTOCOL', 'Balanced standard conditions with normal rewards and fewer early difficulty spikes.'],
        veteran: ['VETERAN PROTOCOL', 'Higher speed, denser waves, and stronger rewards. Recommended for stable loadouts only.']
      },
      rank: ['PILOT RECORD', 'Every deployment grants pilot XP. Rank-ups provide credits, tech cores, skill points, and access to new sectors.']
    }
  };

  function speak(title, message, context = 'FRONTIER PATH') {
    if ($('kiwimiContext')) $('kiwimiContext').textContent = context;
    if ($('kiwimiTitle')) $('kiwimiTitle').textContent = title;
    if ($('kiwimiMessage')) $('kiwimiMessage').textContent = message;
    $('kiwimiPanel')?.classList.add('speaking');
    setTimeout(() => $('kiwimiPanel')?.classList.remove('speaking'), 650);
  }

  $('sectorMap')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-sector]');
    if (!button || button.disabled) return;
    afterRuntime(() => {
      const q = text[language()].sector[button.dataset.sector];
      speak(q[0], q[1], 'SEKTORNAVIGATION');
    });
  });
  $('difficultySelect')?.addEventListener('change', event => afterRuntime(() => {
    const q = text[language()].difficulty[event.target.value];
    speak(q[0], q[1], 'EINSATZLEITUNG');
  }));
  $('pilotRankValue')?.addEventListener('click', () => {
    const q = text[language()].rank;
    speak(q[0], q[1], 'FORTSCHRITT');
  });
  for (const id of ['langDe', 'langEn']) $(id)?.addEventListener('click', () => afterRuntime(() => {
    const q = text[language()].rank;
    if ($('tabDeployment')?.classList.contains('active')) speak(q[0], q[1], 'FORTSCHRITT');
  }));
})();
