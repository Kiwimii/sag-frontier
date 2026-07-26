# Sprint 0.11 — Deep Space Refined

Dieser Sprint ist ein umfassender Qualitäts-, Performance- und Usability-Pass für die prozedurale Deep-Space-Version.

## Behobene Fehler

- Erkundungsdirektiven messen tatsächlich geflogene Route statt nur den größten Abstand zum Startpunkt.
- Raumstationen erzeugen wieder korrekte Credit- und Tech-Core-Werte.
- Railgun, Raketen, Plasma und Resonanzfelder können Ressourcen-Asteroiden zuverlässig beschädigen.
- Plasmafelder treffen auch Wardens.
- Bereits maximierte Upgrades erscheinen nicht erneut als wirkungslose Auswahl.
- Boss-HUD, Eingaben und Overlays werden zwischen Einsätzen zuverlässig zurückgesetzt.
- Tastatursteuerung blockiert keine Eingaben mehr in Importfeldern, Auswahllisten oder Buttons.
- Fokusverlust und Tabwechsel können keine festhängenden Bewegungstasten mehr verursachen.

## Performance

- Nur 25 Chunks rund um den Piloten bleiben aktiv.
- Der Chunk-Cache ist auf 180 Einträge begrenzt; Interaktionszustände werden separat gespeichert.
- Gegner-, Partikel- und Weltobjektmengen besitzen klare Obergrenzen.
- HUD-Aktualisierungen sind auf 10 Hz begrenzt.
- Zielsuche, Projektilkollisionen und Rendering vermeiden unnötige Array-Kopien und Vollsortierungen.
- Asteroidengeometrie wird beim Erzeugen des Chunks vorbereitet statt in jedem Frame neu berechnet.

## Nutzererlebnis

- Drei Sekunden Startschutz und ein sicherer Bereich am Ursprung.
- Radar und Zielkompass zeigen relevante Entdeckungen und Gegner.
- HUD unterscheidet größte Distanz und tatsächlich geflogene Route.
- Scans zeigen ihren Fortschritt.
- Pausemenü enthält Neustart, Abbruch sowie Einstellungen für Bildschirmrütteln, Auto-Pause und Radar.
- Automatische Pause bei verborgenem Browser-Tab.
- Direkter Kopierbutton für den Spielstand.
- Ergebnisansicht zeigt Route und Entdeckungen.
- Waffen, Schiffe und Module erklären ihre Evolutionen, Passiven und aktiven Synergien direkt im Hangar.
- Mobile Explorationstexte bleiben sichtbar und werden kompakter dargestellt.
- Deutsche und englische Deep-Space-Texte sind vollständig eingebunden.

## Qualitätssicherung

Der CI-Lauf rekonstruiert die Runtime aus geprüften, komprimierten Quellen und führt Syntax-, Regression-, Browser-, Eingabe-, Streaming- und Progressionstests aus.
