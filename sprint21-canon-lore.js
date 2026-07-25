(()=>{
  'use strict';
  const Core=window.SAGStoryCore;
  if(!Core)throw new Error('Sprint 21 requires SAGStoryCore');

  const SOURCE={
    canon:{label:'STAR ATLAS KANON',kind:'canon'},
    sag:{label:'SAG CHRONIK',kind:'sag'},
    campaign:{label:'KAMPAGNENFIKTION',kind:'campaign'},
    hypothesis:{label:'UNBESTÄTIGTE HYPOTHESE',kind:'hypothesis'}
  };
  const entry=(id,title,tag,text,source,unlockHint)=>({id,title,tag,text,source:SOURCE[source],unlockHint});

  const lore=[
    entry('kiwimi-founder','Kiwimi und die Idee von SAG','PERSON','Kiwimi gründete Star Atlas Germany als eigenständige deutschsprachige Web3-Gaming-Community. Sein Ziel ist kein zweiter Machtblock neben MUD, ONI und Ustur, sondern ein Gerüst, in dem Menschen Wissen teilen, eigene Vorhaben aufbauen und gemeinsam mehr erreichen können als allein.','sag','Mit der Fraktionswahl verfügbar.'),
    entry('sag-origin','Star Atlas Germany','SAG','SAG versteht sich als multifraktionale, friedlich ausgerichtete DAC. Mitglieder behalten ihre Herkunft und ihren Karriereweg, verpflichten sich jedoch zu Integrität, Respekt, Eigenverantwortung, gegenseitiger Unterstützung und einer gemeinsamen Verteidigung, falls Diplomatie scheitert.','sag','Mit der Fraktionswahl verfügbar.'),
    entry('three-factions','Drei Fraktionen der Galia Expanse','FAKTIONEN','MUD, ONI und Ustur sind die drei dominierenden Fraktionen des Council of Peace. MUD steht für die menschliche Zivilisation und industrielle Stärke, ONI für ein Bündnis verschiedener außerirdischer Spezies und Ustur für eine Kultur empfindungsfähiger Androiden. Ihre Unterschiede bestimmen Herkunft und Perspektive, nicht den Wert eines Piloten.','canon','Mit der Fraktionswahl verfügbar.'),
    entry('mud-origin','Manus Ultima Divina','MUD','MUD ging aus der Menschheit der Erde hervor. Nach der Begegnung mit dem Photoli Ahr vereinigte sich ein großer Teil der Menschheit unter Charon Gotti und brach zu den Sternen auf. Nach den Verlusten des Convergence War entwickelte sich MUD durch Industrie, Rohstoffe und fairen Handel zu einer tragenden Macht des Council of Peace.','canon','Wähle MUD oder vertiefe dein Fraktionswissen.'),
    entry('oni-origin','Das ONI Consortium','ONI','ONI verbindet die Völker der Systeme Om, Segal, Akenat und Neuno. Mierese, Punaab, Photoli und die beinahe ausgelöschten Sogmian fanden im Krieg zu einem strategischen Bündnis. Heute prägen wissenschaftliche Neugier, kulturelle Vielfalt sowie fortgeschrittene Sensor- und Tarntechnik die Region.','canon','Wähle ONI oder vertiefe dein Fraktionswissen.'),
    entry('ustur-origin','Die Ustur','USTUR','Die Ustur sind empfindungsfähige Androiden mit individuellen Persönlichkeiten, Kultur und Spiritualität. Einer Überlieferung zufolge entstanden sie aus einer hochentwickelten KI, die einen magnetarbetriebenen Supercomputer verließ und Jahrhunderte später in vielen physischen Formen wiederkehrte. Ihre Herkunft bleibt Teil ihrer Suche nach Erkenntnis.','canon','Wähle Ustur oder vertiefe dein Fraktionswissen.'),
    entry('iris-cataclysm','Iris und der Cataclysm','GALIA','Der vagabundierende Planet Iris kollidierte mit sieben kleineren Planeten. Aus dieser Katastrophe entstand der Cataclysm: eine Zone voller seltener Materialien und einer einzigartigen Form frei verfügbarer Energie. Die mineralisch-organischen Tufa bewachen die Umgebung von Iris und verteidigen sie gegen Eindringlinge.','canon','Sichere erste Entdeckungsdaten.'),
    entry('convergence-war','Der Convergence War','GESCHICHTE','Als MUD, ONI und Ustur fast gleichzeitig Iris erreichten, verhinderten Stolz, Gier und Unwissen eine gemeinsame Lösung. Der folgende Krieg vernichtete Welten, ruinierte Versorgungssysteme und brachte ganze Spezies an den Rand des Untergangs. Die Busan Last Stand markierte den militärischen Höhepunkt und zugleich den Moment, an dem der Krieg politisch nicht mehr tragbar war.','canon','Erfahre mehr über die Gefahren der Außenzonen.'),
    entry('council-peace','Treaty und Council of Peace','POLITIK','Im Jahr 2523 unterzeichneten Charon Gotti, Bekalu und Armi.eldr den Friedensvertrag. Der Council of Peace sollte Handel, Entdeckungen, Recht, Speziesrechte, Verteidigung und Deeskalation über Fraktionsgrenzen hinweg ordnen. Der Frieden ist erfolgreich, aber nicht selbstverständlich.','canon','Baue Vertrauen zwischen den Fraktionen auf.'),
    entry('starpath','Das StarPath-Netz','INFRASTRUKTUR','Nach dem Krieg verband eine Kette von Warp-Toren die Fraktionsräume. StarPath verkürzte Reisen über Hunderte Lichtjahre und machte friedlichen Handel sowie kulturellen Austausch wieder möglich. Gleichzeitig blieben viele frühere Kolonien außerhalb der sicheren Zonen zurück.','canon','Schließe einen Command-Vertrag ab.'),
    entry('outer-zones','Die verlassenen Außenzonen','FRONTIER','Für den Wiederaufbau zogen sich die drei Fraktionen aus vielen Kolonien der mittleren und hohen Risikozonen zurück. Im entstandenen Machtvakuum etablierten sich regionale Kriegsherren, Piraten und radikale Gruppen. Eine neue Generation von DACs kehrt nun dorthin zurück und setzt den fragilen Frieden unter Druck.','canon','Fliege tiefer in die Frontier.'),
    entry('minor-powers','Jorvik, ECOS, Tufa und Photoli','GRUPPEN','Außerhalb der sicheren Fraktionsräume wirken weitere Mächte. Jorvik-Piraten operieren in mittleren und hohen Risikozonen. ECOS verfolgt radikale ökologische Ziele. Die Tufa schützen den Cataclysm, während die uralten Photoli nur Bruchteile ihrer überlegenen Technologie teilen.','canon','Begegne stärkeren Gegnern und Grenzereignissen.'),
    entry('command-network','Das SAG Command Network','SAG','Das Command Network ist die spielinterne Einsatzstruktur von SAG. Es bündelt Verträge, Forschungsdaten und Erfahrungswerte der Mitglieder. Es ist keine offizielle Einrichtung des Council of Peace, sondern eine eigenständige SAG-Lösung für koordinierte Expeditionen und transparente Zusammenarbeit.','sag','Schließe einen Command-Vertrag ab.'),
    entry('sag-matrix','Die SAG-Matrixorganisation','SAG','SAG verbindet Karrierebereiche und Fraktionsvertretungen. Fachliche Verantwortung liegt bei Bereichen wie Rohstoffförderung, Manufaktur, Logistik, Verteidigung und Sonderoperationen; Fraktionsvertretungen sichern Diplomatie und Interessenabgleich. Initiativen können darunter weitgehend eigenständig wachsen.','sag','Erreiche fortgeschrittenen Anwärterstatus.'),
    entry('founding-charter','Die SAG-Charta','SAG','Die Charta stellt Integrität, Respekt, Datenschutz, Solidarität, Friedensbestrebungen, Diversität, Eigenverantwortung, Unterstützung neuer Mitglieder, Nachhaltigkeit und Rechenschaft in den Mittelpunkt. Sie ist kein militärischer Eid, sondern der gemeinsame Mindeststandard einer freiwilligen Gemeinschaft.','sag','Gewinne Kiwimis Vertrauen.'),
    entry('frontier-signal','Der Iris-Datenblock','FELDBERICHT','Ein beschädigter Datensatz aus der Nähe des Cataclysm taucht im SAG-Kanal auf. Seine historischen Koordinaten sind plausibel, seine aktuelle Signatur jedoch unbekannt. Die Kampagne behandelt ihn als möglichen Auslöser neuer Expeditionen, nicht als bestätigtes Ereignis des offiziellen Kanons.','campaign','Finde mindestens zwei Entdeckungen.'),
    entry('warden-protocol','Grenzwächter-Protokoll','FELDBERICHT','Die im Spiel auftretenden Wardens sind eine eigene Bedrohung der SAG-Frontier-Kampagne. Kiwimi ordnet ihre Bewegungen nicht vorschnell einer offiziellen Fraktion zu. Erst gesicherte Daten entscheiden, ob es sich um autonome Verteidigung, Piraterie oder etwas Neues handelt.','campaign','Besiege deinen ersten Warden.'),
    entry('anomaly-theory','Resonanz am Cataclysm','HYPOTHESE','SAG-Analysten vermuten, dass bestimmte Anomalien auf Energieprofile und Kommunikationsmuster reagieren. Offizielle Archive bestätigen die einzigartige Energie des Cataclysm, nicht jedoch diese konkrete Resonanztheorie. Sie bleibt eine Arbeitshypothese der Kampagne.','hypothesis','Fliege insgesamt 8.000 Distanz.'),
    entry('black-signal','Das schwarze Signal','GEHEIM','Hinter den Warden-Daten erscheint ein schwaches zweites Muster. Es wird in der Kampagne als schwarzes Signal bezeichnet. Weder der Council of Peace noch eine bekannte Fraktion hat seine Existenz bestätigt. SAG behandelt es als Risiko, nicht als Wahrheit.','campaign','Besiege fünf Wardens und erreiche die tiefe Frontier.'),
    entry('membership','Mitgliedschaft in SAG','SAG','Die Aufnahme beendet nicht die Geschichte. Ein Mitglied vertritt SAG, unterstützt neue Piloten und kann eigene Projekte oder Unternehmen unter dem gemeinsamen Dach entwickeln. Einfluss entsteht aus Beitrag, Vertrauen und Verantwortung – nicht allein aus Kampfstärke.','sag','Bestehe die Aufnahmeprüfung.')
  ];

  Core.LORE.splice(0,Core.LORE.length,...lore);
  Core.FACTIONS.mud.title='Manus Ultima Divina';
  Core.FACTIONS.mud.description='Menschen aus der Erde: industrielle Stärke, Rohstoffe, Handel und eine komplexe religiös-politische Vergangenheit.';
  Core.FACTIONS.oni.title='Das ONI Consortium';
  Core.FACTIONS.oni.description='Ein Bündnis verschiedener außerirdischer Spezies: Vielfalt, Wissenschaft, Sensorik und gemeinsame Sicherheit.';
  Core.FACTIONS.ustur.title='Die erwachten Androiden';
  Core.FACTIONS.ustur.description='Empfindungsfähige künstliche Wesen: individuelle Identität, technische Anpassung und spirituelle Erkenntnissuche.';

  const originalUnlock=Core.unlockLore.bind(Core);
  Core.unlockLore=(story,base,progression)=>{
    const next=originalUnlock(story,base,progression),set=new Set(next.loreUnlocked||[]),stats=Core.baseStats(base||{}),p=progression||{};
    if(next.faction){
      set.add(`${next.faction}-origin`);
      set.add('council-peace');
    }
    if(stats.discoveries>=1)set.add('iris-cataclysm');
    if(stats.runs>=1)set.add('convergence-war');
    if((Number(p.completedContracts)||0)>=1)set.add('starpath');
    if(stats.distance>=8000)set.add('outer-zones');
    if(stats.bosses>=1)set.add('minor-powers');
    if(next.sagReputation>=40)set.add('sag-matrix');
    next.loreUnlocked=[...set];
    return next;
  };

  window.SAG25Lore={SOURCE,lore,version:21};
})();