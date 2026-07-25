(()=>{
  'use strict';
  const Core=window.SAGStoryCore;
  if(!Core)throw new Error('SAGStoryCore missing for narrative bible');

  const canon='STAR ATLAS KANON';
  const sag='SAG DAC';
  const fiction='SAG FRONTIER FIKTION';

  Object.assign(Core.FACTIONS.mud,{
    title:'Manus Ultima Divina',
    description:'Die menschliche Fraktion aus dem Erbe der Erde. MUD verbindet industrielle Stärke, Rohstoffzugang, Handel und Diplomatie unter Charon Gotti Jr.',
    voice:'pragmatisch, direkt, verantwortungsbewusst'
  });
  Object.assign(Core.FACTIONS.oni,{
    title:'Das ONI-Konsortium',
    description:'Ein Bündnis mehrerer außerirdischer Spezies. ONI steht für kulturelle Vielfalt, wissenschaftliche Neugier, Dokumentation und neue Entdeckungen.',
    voice:'beobachtend, präzise, vielstimmig'
  });
  Object.assign(Core.FACTIONS.ustur,{
    title:'Der Ustur-Sektor',
    description:'Eine Zivilisation erwachter, empfindungsfähiger Androiden. Ustur sucht Erkenntnis, Effizienz und die systematische Erweiterung des eigenen Bewusstseins.',
    voice:'analytisch, ruhig, philosophisch'
  });

  const lore=[
    {id:'kiwimi-founder',title:'Kiwimi und die Idee von SAG',tag:'GRÜNDER',scope:sag,text:'Kiwimi gründete Star Atlas Germany als eigenständige deutschsprachige Web3-Gaming-Community mit starkem Bezug zu Star Atlas. SAG ist keine offizielle Organisation von Star Atlas oder ATMTA. Die Idee ist ein Gerüst, in dem Menschen ihre eigenen Fähigkeiten einbringen, Wissen teilen und gemeinsam etwas aufbauen können.'},
    {id:'sag-origin',title:'Star Atlas Germany als eigene DAC',tag:'SAG',scope:sag,text:'SAG versteht sich als unabhängige, community-getriebene Decentralized Autonomous Corporation. Sie organisiert sich selbst, entwickelt eigene Werte und Ziele und kann innerhalb der Galia Expanse mit anderen Organisationen kooperieren, ohne Teil der offiziellen Star-Atlas-Strukturen zu sein.'},
    {id:'three-factions',title:'Drei Fraktionen, eine deutschsprachige Crew',tag:'FAKTIONEN',scope:sag,text:'SAG ist multifraktional. MUD, ONI und Ustur bleiben politische und kulturelle Herkunft der Piloten. Innerhalb von SAG sollen ihre unterschiedlichen Stärken jedoch zusammenwirken: Industrie, Forschung, Diplomatie, Logistik, Exploration und Verteidigung.'},
    {id:'iris-cataclysm',title:'Iris und der Cataclysm',tag:'GALIA',scope:canon,text:'Der wandernde Planet Iris kollidierte mit sieben kleineren Planeten und schuf den Cataclysm. Die Region enthält seltene Materialien und eine ungewöhnliche Form freier Energie. In den Asteroidengürteln nahe Iris leben die Tufa, mineralisch-organische Wesen, die das Gebiet erbittert verteidigen.'},
    {id:'convergence-war',title:'Der Convergence War',tag:'GESCHICHTE',scope:canon,text:'MUD, ONI und Ustur erreichten nahezu gleichzeitig die Grenzen des Cataclysm. Stolz, Gier und gegenseitiges Misstrauen verhinderten eine gemeinsame Lösung. Der folgende Convergence War zerstörte Welten, Handelswege und ganze Zivilisationen und brachte alle drei Fraktionen an den Rand des Zusammenbruchs.'},
    {id:'treaty-2523',title:'Der Friedensvertrag von 2523',tag:'VERTRAG',scope:canon,text:'Im Jahr 2523 verpflichteten sich MUD, ONI und Ustur zu einem gemeinsamen Friedensrahmen. MUD brachte Handel, Bergbau und Governance ein; ONI Dokumentation, Entdeckungsregeln und galaktische Strafverfolgung; Ustur Speziesrechte, Verteidigung und Deeskalation.'},
    {id:'council-peace',title:'Der Council of Peace',tag:'POLITIK',scope:canon,text:'Aus dem Friedensvertrag entstand der Council of Peace. Er soll Konflikte zwischen den Fraktionen regeln und die Kooperation in Galia sichern. Der Frieden ist wirksam, aber nicht selbstverständlich: Er besteht nur, solange Organisationen und Piloten bereit sind, gemeinsame Regeln über kurzfristige Vorteile zu stellen.'},
    {id:'galia-risk-zones',title:'Die Risikozonen von Galia',tag:'NAVIGATION',scope:canon,text:'Die sicheren Fraktionsräume bilden nur einen Teil der Galia Expanse. Jenseits davon liegen Medium- und High-Risk-Zonen mit verlassenen Kolonien, konkurrierenden Organisationen, Piraten, radikalen Gruppen und wertvollen Ressourcen. Je tiefer ein Pilot fliegt, desto weniger kann er auf Schutz durch die Fraktionen zählen.'},
    {id:'starpath',title:'StarPath',tag:'INFRASTRUKTUR',scope:canon,text:'Nach dem Krieg verband der Council of Peace die Fraktionsräume durch StarPath, ein Netz aus Warp-Toren. Es machte Handel und kulturellen Austausch über enorme Distanzen möglich. Jeder beschädigte Knoten bedroht deshalb nicht nur eine Route, sondern das fragile Geflecht des Friedens.'},
    {id:'abandoned-colonies',title:'Die verlassenen Kolonien',tag:'FRONTIER',scope:canon,text:'Während des Wiederaufbaus zogen sich die großen Fraktionen aus vielen Kolonien der Medium- und High-Risk-Zonen zurück. Einige Welten verfielen, andere gerieten unter die Kontrolle regionaler Kriegsherren. Ihre Ruinen enthalten Ressourcen, Daten und offene Rechnungen aus der Zeit vor dem Frieden.'},
    {id:'jorvik-ecos',title:'Jorvik und ECOS',tag:'AUSSENSEITER',scope:canon,text:'Jorvik-Raider und die radikalen Terraformer von ECOS gehören zu den Mächten außerhalb der Ordnung des Council of Peace. Sie sind keine einheitliche Bedrohung, aber ein Beweis dafür, dass die Fraktionsordnung in der äußeren Galia Expanse nur begrenzte Reichweite besitzt.'},
    {id:'frontier-signal',title:'Das Echo von Iris',tag:'KAMPAGNE',scope:fiction,text:'SAG-Sensoren empfangen ein wiederkehrendes Muster, das aus Richtung des Cataclysm zu kommen scheint. Es ist kein offizieller Teil des Star-Atlas-Kanons, sondern die zentrale Fiktion dieser Kampagne. Das Signal imitiert alte Navigationsdaten und reagiert auf multifraktionale Übertragungen.'},
    {id:'warden-protocol',title:'Das Warden-Protokoll',tag:'KAMPAGNE',scope:fiction,text:'Die sogenannten Wardens sind autonome Wächter der SAG-Frontier-Kampagne. Ihre Herkunft ist ungeklärt. Einige tragen Fragmente alter Kriegsprotokolle, andere reagieren auf Datenmuster aus verlassenen Kolonien. Sie sind eine spielinterne Erfindung und keine kanonische Star-Atlas-Fraktion.'},
    {id:'command-network',title:'Das SAG Command Network',tag:'SAG',scope:fiction,text:'Das Command Network ist das operative Nervensystem dieser SAG-Kampagne. Es bündelt Einsätze, Verträge, Forschungsdaten und Debriefings. In der Geschichte dient es Kiwimi und den SAG-Spezialisten als gemeinsames Lagebild für eine Organisation, die über drei Fraktionsräume verteilt arbeitet.'},
    {id:'anomaly-theory',title:'Die Resonanztheorie',tag:'ANOMALIE',scope:fiction,text:'SAG-Analysten vermuten, dass das Echo von Iris nicht nur ein Signal sendet, sondern auf Entscheidungen reagiert. Ustur-Modelle sprechen von einer lernenden Resonanz; ONI-Forscher von einem kulturellen Archiv; MUD-Ingenieure von einem beschädigten Netzwerk aus der Kriegszeit.'},
    {id:'founding-charter',title:'Die SAG-Charta',tag:'WERTE',scope:sag,text:'SAG versteht Gemeinschaft nicht als Zwang. Freiheit und Eigenverantwortung stehen neben Integrität, Respekt, Solidarität, Datenschutz, friedlicher Konfliktlösung, Inklusion, Mentoring und nachhaltigem Handeln. Die Aufnahmeprüfung soll deshalb Charakter und Kooperation ebenso bewerten wie Leistung.'},
    {id:'sag-public-community',title:'Community und Mitgliedschaft',tag:'SAG',scope:sag,text:'Die öffentliche deutschsprachige SAG-Community ist offen für Interessierte, Solospieler und Mitglieder anderer DACs. Eine formelle Mitgliedschaft in der SAG-DAC ist davon getrennt. Im Spiel bedeutet das: Zugang zu Wissen ist offen, der offizielle SAG-Status muss jedoch durch Verlässlichkeit und gelebte Werte verdient werden.'},
    {id:'sag-matrix',title:'Karrierepfade innerhalb von SAG',tag:'ORGANISATION',scope:sag,text:'SAG verbindet Fraktionsvertretung mit fachlichen Karrierepfaden. Rohstoffgewinnung, Fertigung, Handel und Logistik, Verteidigung, Exploration, Datenarbeit, Reparatur, Rettung und Sonderoperationen können eigene Teams bilden. Führung soll aus nachgewiesener Kompetenz und Vertrauen entstehen, nicht nur aus Besitz.'},
    {id:'black-signal',title:'Das schwarze Signal',tag:'GEHEIMNIS',scope:fiction,text:'Hinter dem Echo von Iris liegt ein zweites, fast lautloses Muster. Es katalogisiert Schiffe, Entscheidungen und Kommunikationsbeziehungen. Kiwimi fürchtet nicht, dass es SAG angreift. Er fürchtet, dass es verstehen will, warum drei Fraktionen erneut beginnen, gemeinsam in die Frontier zu fliegen.'},
    {id:'membership',title:'Aufnahme in Star Atlas Germany',tag:'ABSCHLUSS',scope:sag,text:'Die Aufnahme macht einen Piloten nicht zu einem offiziellen Vertreter von Star Atlas oder ATMTA. Sie bedeutet ausschließlich, innerhalb dieser Geschichte als Mitglied der unabhängigen SAG-DAC anerkannt zu werden und ihre Werte, ihren Namen und ihre Gemeinschaft verantwortungsvoll zu vertreten.'}
  ];
  Core.LORE.splice(0,Core.LORE.length,...lore);

  const chapterCopy=[
    {id:1,title:'DIE ORDNUNG VON GALIA',subtitle:'Wähle deine Fraktion und verstehe den Frieden, in dem du fliegst.',scene:'2523 endete der Krieg. Die Generation danach beginnt, den Rand der bekannten Ordnung erneut zu betreten.'},
    {id:2,title:'DIE VERLASSENEN WELTEN',subtitle:'Sichere Wege, statt nur Ziele zu vernichten.',scene:'Jenseits der sicheren Zonen warten Kolonien, die der Frieden nie erreicht hat.'},
    {id:3,title:'DAS ECHO VON IRIS',subtitle:'Folge dem Signal durch StarPath und die äußeren Korridore.',scene:'Ein Muster aus Richtung des Cataclysm reagiert auf die Zusammenarbeit der Fraktionen.'},
    {id:4,title:'DIE SAG-CHARTA',subtitle:'Lerne, warum SAG unabhängig und multifraktional organisiert ist.',scene:'Kiwimi sucht keine Gefolgschaft. Er sucht Menschen, die eine freie Gemeinschaft tragfähig machen.'},
    {id:5,title:'DIE EIGENE FLAGGE',subtitle:'Verdiene dir die Aufnahme in eine eigenständige DAC.',scene:'Deine Fraktion ist deine Herkunft. SAG wird zu deiner gewählten Verantwortung.'}
  ];
  Core.CHAPTERS.splice(0,Core.CHAPTERS.length,...chapterCopy);

  const missionCopy={
    'c1-faction':['Registrierung in Galia','Wähle MUD, ONI oder Ustur. SAG arbeitet über alle drei Fraktionsräume hinweg, ersetzt aber keine Fraktionszugehörigkeit.'],
    'c1-flight':['Erstes Einsatzlog','Schließe deinen ersten Einsatz ab und übermittle ein vollständiges Log an das SAG Command Network.'],
    'c1-signal':['Das Echo von Iris','Finde zwei Entdeckungen oder fliege mindestens 1.500 Distanz, um das unbekannte Signal einzugrenzen.'],
    'c2-eliminate':['Korridorverteidigung','Neutralisiere 60 feindliche Einheiten, die einen zivilen Korridor außerhalb der sicheren Zone blockieren.'],
    'c2-salvage':['Spuren der verlassenen Kolonien','Untersuche sechs Asteroiden oder zwei Stationen und sichere Daten, bevor Plünderer sie vernichten.'],
    'c2-warden':['Warden-Protokoll','Besiege einen Warden und bringe seinen Kern zur gemeinsamen Analyse zurück.'],
    'c3-route':['Jenseits der Safe Zone','Erreiche insgesamt 8.000 Distanz und kartiere eine belastbare Route in die äußeren Korridore.'],
    'c3-contracts':['StarPath-Verlässlichkeit','Schließe zwei Command-Verträge ab. Eine DAC wird nicht durch Absichten, sondern durch eingehaltene Zusagen glaubwürdig.'],
    'c3-rift':['Daten aus dem Cataclysm','Sammle 18 Entdeckungen, um die Resonanz des Iris-Signals mit bekannten Galia-Daten zu vergleichen.'],
    'c4-archive':['Die Gründungschronik','Schalte sechs Codex-Einträge frei und unterscheide Star-Atlas-Kanon, SAG-DAC und Kampagnenfiktion.'],
    'c4-trust':['Die Charta unter Druck','Erreiche 45 SAG-Ruf und 35 Vertrauen. Kiwimi bewertet, ob deine Entscheidungen mit den SAG-Werten vereinbar sind.'],
    'c4-black':['Das schwarze Signal','Besiege fünf Wardens und fliege 30.000 Distanz, um den Ursprung des zweiten Signals zu lokalisieren.'],
    'c5-candidate':['DAC-Anwärterstatus','Erreiche 70 SAG-Ruf und 55 Vertrauen. Damit öffnet der SAG-Rat deinen letzten Prüfkanal.'],
    'c5-frontier':['Gemeinschaft vor Ruhm','Erreiche 450 Abschüsse, acht Wardens und zwölf Einsätze, ohne den Auftrag der zivilen Korridore aus den Augen zu verlieren.'],
    'c5-admission':['Aufnahme unter eigener Flagge','Schließe alle vorherigen Missionen ab und entscheide dich bewusst für die unabhängige SAG-DAC.']
  };
  Core.MISSIONS.forEach(mission=>{const copy=missionCopy[mission.id];if(copy){mission.title=copy[0];mission.text=copy[1];}});

  const events=[
    {id:'distress',title:'NOTRUF AUS EINER VERLASSENEN KOLONIE',text:'Ein altes Koloniesignal liegt außerhalb des Schutzbereichs des Council of Peace.',choices:[{id:'rescue',label:'BESATZUNG EVAKUIEREN',result:'Du bringst die Überlebenden in einen sicheren SAG-Korridor und dokumentierst ihre Geschichte.',reward:{sagReputation:4,kiwimiTrust:5,credits:90,lore:'abandoned-colonies'}},{id:'salvage',label:'VERSORGUNGSKERN BERGEN',result:'Du sicherst dringend benötigtes Material, doch das Schicksal der Besatzung bleibt ungeklärt.',reward:{credits:240,kiwimiTrust:-2}}]},
    {id:'starpath-relay',title:'GESTÖRTER STARPATH-RELAIS',text:'Ein beschädigtes Relais gefährdet Handelsschiffe aus allen drei Fraktionen.',choices:[{id:'repair',label:'RELAIS STABILISIEREN',result:'Die Route bleibt offen. Drei Fraktionen profitieren von einer Entscheidung, die niemand allein bezahlt hätte.',reward:{sagReputation:5,kiwimiTrust:4,commandData:2,lore:'starpath'}},{id:'extract',label:'DATENKERN EXTRAHIEREN',result:'Du sicherst seltene Routendaten, während der Korridor vorübergehend geschlossen bleibt.',reward:{commandData:4,credits:120}}]},
    {id:'cop-inspection',title:'COUNCIL-OF-PEACE-KONTROLLE',text:'Eine Patrouille verlangt eine klare Kennzeichnung deiner Fraktions- und DAC-Zugehörigkeit.',choices:[{id:'transparent',label:'BEIDE IDENTITÄTEN OFFENLEGEN',result:'Du weist deine Fraktionszugehörigkeit und SAG als unabhängige DAC transparent aus.',reward:{sagReputation:4,factionReputation:3,kiwimiTrust:3,lore:'council-peace'}},{id:'faction-only',label:'NUR FRAKTION NENNEN',result:'Die Kontrolle endet schnell. Der SAG-Kanal bleibt jedoch bewusst unsichtbar.',reward:{factionReputation:5,credits:100}}]},
    {id:'tufa-border',title:'TUFA-WARNUNG AM CATACLYSM',text:'Mineralisch-organische Signaturen markieren eine Grenze nahe Iris. Der Ressourcenwert ist enorm.',choices:[{id:'withdraw',label:'GRENZE RESPEKTIEREN',result:'Du kartierst die Warnzone und ziehst dich zurück. Kiwimi wertet Zurückhaltung als Stärke.',reward:{kiwimiTrust:6,sagReputation:3,lore:'iris-cataclysm'}},{id:'scan',label:'FERNSCAN DURCHFÜHREN',result:'Du bleibst außerhalb der markierten Zone und sicherst dennoch wertvolle Spektraldaten.',reward:{commandData:3,cores:1}}]},
    {id:'jorvik-offer',title:'JORVIK-TRANSPONDER',text:'Ein Raider bietet Informationen über das schwarze Signal gegen freie Passage.',choices:[{id:'negotiate',label:'INFORMATIONEN KAUFEN',result:'Du handelst, ohne den Raider in SAG aufzunehmen oder seine Methoden zu legitimieren.',reward:{commandData:3,credits:-80,lore:'jorvik-ecos'}},{id:'refuse',label:'KORRIDOR VERTEIDIGEN',result:'Du verweigerst den Handel und sicherst die Route gegen den Raiderverband.',reward:{sagReputation:4,kiwimiTrust:3,credits:140}}]},
    {id:'drone',title:'ALTE SAG-AUFKLÄRUNGSDROHNE',text:'Eine beschädigte Drohne sendet eine frühe Kiwimi-Signatur aus der Gründungszeit.',choices:[{id:'return',label:'AN SAG ZURÜCKSENDEN',result:'Kiwimi erkennt die Seriennummer. Das Fragment gehört zu den ersten Tests des Command Networks.',reward:{sagReputation:3,kiwimiTrust:5,commandData:2,lore:'command-network'}},{id:'analyze',label:'VOR ORT ANALYSIEREN',result:'Du sicherst ein technisches Fragment, riskierst aber den Verlust des historischen Originals.',reward:{cores:1,commandData:2}}]},
    {id:'shard',title:'RESONANZFRAGMENT',text:'Ein schwarzer Splitter reagiert auf dein Fraktionssignal und auf die SAG-Kennung gleichzeitig.',choices:[{id:'scan',label:'MULTIFRAKTIONALEN SCAN STARTEN',result:'Das Fragment antwortet erst, als beide Identitäten gleichzeitig übertragen werden.',reward:{sagReputation:3,commandData:2,lore:'anomaly-theory'}},{id:'destroy',label:'RISIKO BEENDEN',result:'Du vernichtest das Fragment, bevor es weitere Daten über deine Crew sammeln kann.',reward:{kiwimiTrust:4,credits:120}}]},
    {id:'kiwimi',title:'KIWIMIS DIREKTKANAL',text:'„Eine Fraktion gibt dir Herkunft. Eine DAC gibt dir eine Aufgabe, die du selbst mitträgst.“',choices:[{id:'accept',label:'VERANTWORTUNG ANNEHMEN',result:'Kiwimi markiert dich als Anwärter, der SAG nicht mit einem bloßen Tag verwechselt.',reward:{sagReputation:5,kiwimiTrust:5,lore:'founding-charter'}},{id:'question',label:'UNABHÄNGIGKEIT HINTERFRAGEN',result:'Kiwimi begrüßt die Frage. Eine autonome Organisation muss Kritik aushalten können.',reward:{kiwimiTrust:4,commandData:2,lore:'sag-origin'}}]}
  ];
  Core.EVENTS.splice(0,Core.EVENTS.length,...events);

  const baseUnlock=Core.unlockLore.bind(Core);
  Core.unlockLore=(story,base,progression)=>{
    const next=baseUnlock(story,base,progression),stats=Core.baseStats(base),set=new Set(next.loreUnlocked),contracts=Number(progression?.completedContracts)||0;
    if(next.faction){['iris-cataclysm','convergence-war','treaty-2523','council-peace'].forEach(id=>set.add(id));}
    if(stats.distance>=1500)set.add('galia-risk-zones');
    if(stats.runs>=1)set.add('sag-public-community');
    if(stats.asteroids>=3||stats.stations>=1)set.add('abandoned-colonies');
    if(contracts>=1)set.add('starpath');
    if(next.sagReputation>=25)set.add('sag-matrix');
    if(stats.bosses>=3)set.add('jorvik-ecos');
    next.loreUnlocked=[...set];return next;
  };

  window.SAGNarrativeBible={version:21,canonNote:'Star Atlas canon, SAG DAC material and original campaign fiction are labelled separately.',scopes:{canon,sag,fiction}};
})();