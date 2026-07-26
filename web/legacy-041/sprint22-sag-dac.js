(()=>{
  'use strict';
  const Core=window.SAGStoryCore;
  if(!Core)throw new Error('Sprint 22 requires SAGStoryCore');

  const CHARTER=[
    {id:'integrity',title:'Integrität',text:'Informationen werden geprüft, Zusagen eingehalten und Fehler offen benannt.'},
    {id:'respect',title:'Respekt',text:'Herkunft, Erfahrung und Karriereweg entscheiden nicht über den Wert eines Mitglieds.'},
    {id:'solidarity',title:'Solidarität',text:'Erfahrene Mitglieder helfen neuen Piloten, ohne ihnen jede Entscheidung abzunehmen.'},
    {id:'peace',title:'Friedensbestrebung',text:'SAG sucht Kooperation und Diplomatie. Verteidigung ist notwendig; Provokation im Namen der DAC ist es nicht.'},
    {id:'agency',title:'Eigenverantwortung',text:'Mitglieder wählen ihren Beitrag selbst und tragen die Folgen ihrer Entscheidungen.'},
    {id:'foresight',title:'Weitblick',text:'Ressourcen, Beziehungen und Reputation werden nicht für einen kurzfristigen Vorteil geopfert.'}
  ];

  const CAREERS=[
    {id:'resources',title:'Rohstoffe und Veredelung',brief:'Bergbau, Erkundung von Vorkommen und verantwortungsvolle Verarbeitung.'},
    {id:'engineering',title:'Manufaktur und Ingenieurswesen',brief:'Komponenten, Ausrüstung, Schiffe und belastbare technische Lösungen.'},
    {id:'logistics',title:'Logistik und Handel',brief:'Versorgung, Transportkorridore, Märkte und verlässliche Lieferketten.'},
    {id:'defense',title:'Kriegsführung und Verteidigung',brief:'Schutz von Crews und Infrastruktur sowie kontrollierte Gefahrenabwehr.'},
    {id:'special',title:'Sonderoperationen',brief:'Exploration, Data Running, Rettung, Reparatur, Betankung und ausgewählte Aufträge.'}
  ];

  const LEVELS=[
    {id:'community',title:'Öffentliche Community',text:'Deutschsprachiger Austausch bleibt auch für Solospieler und Mitglieder anderer DACs offen.'},
    {id:'member',title:'SAG-Mitglied',text:'Vertritt die DAC, lebt die Charta und beteiligt sich am gemeinsamen Aufbau.'},
    {id:'manager',title:'Initiative oder Unternehmen',text:'Mitglieder können eigene Vorhaben unter dem Dach von SAG entwickeln und führen.'},
    {id:'council',title:'Gemeinsamer Rat',text:'Fach- und Fraktionsvertretungen koordinieren Strategie, Diplomatie und DAC-weite Entscheidungen.'}
  ];

  const VOICE={
    principles:[
      'Kiwimi spricht ruhig, direkt und ohne militärisches Pathos.',
      'Er behauptet nie, eine ungeklärte Theorie sei bewiesen.',
      'Er lobt konkrete Entscheidungen statt abstrakte Stärke.',
      'Er erklärt SAG als Werkzeug für Mitglieder, nicht als Selbstzweck.',
      'Er lässt dem Piloten Freiheit, fordert dafür aber Verantwortung.'
    ],
    lines:{
      welcome:'SAG braucht keine Piloten, die jedes Risiko suchen. SAG braucht Menschen, die wissen, welches Risiko wofür sinnvoll ist.',
      faction:'Deine Fraktion erklärt, woher du kommst. Sie entscheidet nicht, was du für andere möglich machst.',
      lore:'Ein Archiv ist kein Museum. Es ist eine Sammlung von Fehlern, die wir nicht wiederholen müssen.',
      council:'Ein Rat ist dann nützlich, wenn er Entscheidungen besser macht – nicht nur langsamer.',
      admission:'Du bewirbst dich nicht um ein Abzeichen. Du bewirbst dich um Verantwortung.'
    }
  };

  const SAG={
    name:'Star Atlas Germany',
    short:'SAG',
    founded:'2022',
    type:'Eigenständige, community-getriebene und multifraktionale DAC',
    disclaimer:'SAG ist eine eigenständige Community und keine offizielle Organisation von Star Atlas oder ATMTA.',
    mission:'Deutschsprachige Piloten über Fraktions- und Karrieregrenzen hinweg verbinden, Wissen zugänglich machen und eigenständige Vorhaben ermöglichen.',
    posture:'Friedlich und partnerschaftlich ausgerichtet; geschlossen verteidigungsfähig, aber ohne aktive Piraterie oder Provokation.',
    charter:CHARTER,
    careers:CAREERS,
    levels:LEVELS,
    voice:VOICE
  };

  window.SAG25Content={...(window.SAG25Content||{}),SAG,CHARTER,CAREERS,LEVELS,VOICE,version:22};
})();