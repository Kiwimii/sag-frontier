# Sprint 0.12 — Modular Deep Space

Sprint 0.12 konsolidiert die über mehrere Iterationen gewachsene Produktionsstruktur, ohne das bestehende Spielverhalten neu zu erfinden.

## Neue Produktionsstruktur

Die Spielseite lädt jetzt nur noch:

1. `sprint12.bundle.css`
2. `sprint12-config.js`
3. `sprint12-source.js`
4. `sprint12-ui.js`

Die zuvor separat geladenen acht Stylesheets und vier UI-/Branding-Skripte werden reproduzierbar zu zwei Produktionsdateien gebündelt.

## Zentrale Balance-Konfiguration

`src/config/sprint12.balance.js` enthält die wichtigsten veränderlichen Parameter:

- Chunk-Größe, aktiver Weltradius und Cache-Grenze
- Sicherheitsradien und Stationswahrscheinlichkeit
- visuelle Skalierung für schwächere Geräte
- HUD-, Toast- und Startschutz-Timing
- maximale Gegnerzahl je Schwierigkeitsgrad
- Erkundungs-, Stations- und Asteroidenbelohnungen
- Tech-Core-Pity-System
- Standardwerte für Radar, Auto-Pause und Bildschirmrütteln

Die Konfiguration wird rekursiv eingefroren. Unbeabsichtigte Änderungen während eines Runs sind damit ausgeschlossen.

## Reproduzierbarer Build

`src/config/sprint12.manifest.json` definiert die Eingabedateien. `tools/build-sprint12.cjs` erzeugt daraus deterministisch die Produktionsdateien und bricht ab, sobald erwartete Runtime-Strukturen nicht mehr gefunden werden. Dadurch können spätere Änderungen nicht unbemerkt an der Konfiguration vorbeilaufen.

## Tests

Die CI prüft:

- JavaScript-Syntax aller Produktionsdateien
- genau ein externes Stylesheet
- korrekte Reihenfolge der drei JavaScript-Dateien
- Verwendung der zentralen Konfiguration in der Runtime
- Entfernung alter Sprint-11-Kopplungen
- vollständige Hangarinhalte
- Start eines Einsatzes
- laufende Spielzeit und Tastatursteuerung
- Pause und Fortsetzen

## Weiterentwicklung

Neue Balance-Anpassungen sollen künftig zuerst in `src/config/sprint12.balance.js` erfolgen. Neue Styles oder UI-Module werden über das Manifest in den Produktionsbuild aufgenommen. Die alten Sprint-Dateien bleiben als nachvollziehbare Entwicklungsstufen erhalten, sind aber keine direkten Produktionsabhängigkeiten der Spielseite mehr.
