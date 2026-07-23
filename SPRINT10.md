# Sprint 0.10 — Deep Space

## Zielbild

Der bisherige Bildschirm ist keine feste Arena mehr. Das Schiff bewegt sich in Weltkoordinaten, während eine weiche Kamera folgt. Neue Raumabschnitte werden deterministisch pro Chunk erzeugt, sobald der Spieler in deren Nähe kommt.

Die neue Kernschleife lautet:

**Erkunden → Signatur entdecken → Risiko abwägen → bergen oder weiterfliegen → Ressourcen in den Hangar bringen**

## Prozedurale Raumkarte

- Welt wird in 900 × 900 Einheiten große Chunks geteilt.
- Rund um die aktuelle Position werden nur die benötigten Chunks erzeugt.
- Eine deterministische Seed-Funktion stellt sicher, dass ein erzeugter Chunk während des Runs konsistent bleibt.
- Kamera und Spiellogik arbeiten mit Weltkoordinaten; der Spieler wird nicht mehr an den Bildschirmrand geklemmt.
- Gegner erscheinen weiterhin an den sichtbaren Kamerarändern und verfolgen den Spieler im Weltkoordinatensystem.
- Ein lokales Radar zeigt bereits entdeckte Stationen und Ressourcenfelder.

## Entdeckungen

### Ressourcen-Asteroiden

- besitzen Strukturpunkte und werden automatisch anvisiert, wenn keine unmittelbaren Gegner vorhanden sind
- blockieren Bewegung und verursachen bei Kollision leichten Schaden
- geben nach dem Abbau Credits, Loot und gelegentlich Tech-Kerne frei

### Verlassene Raumstationen

- werden beim Annähern gescannt
- drei Sekunden Nähe schließen den Bergungsvorgang ab
- liefern Credits, Heilung, Schildenergie und zusätzliche Pickups
- können nicht zerstört werden

## Einbindung in vorhandene Systeme

- Exploration ist eine zusätzliche Direktivenart.
- Funde erhöhen Punkte und Einsatzbelohnungen.
- Entdeckungen, Stationen, Asteroiden und größte Reisedistanz werden dauerhaft statistisch gespeichert.
- Sektoren und Schwierigkeitsstufen beeinflussen weiterhin Gegner, Spawnrate und Belohnungen.
- Waffen-Chips, große Upgrades, Pilotenrang und Skill Tree bleiben unverändert kompatibel.

## Combat Identity

### Schiffspassiven

- **Vanguard:** repariert nach einer großen Upgrade-Entscheidung einen kleinen Teil der Hülle.
- **Interceptor:** Abschüsse reduzieren die Dash-Abklingzeit; Dash aktiviert kurz Overdrive.
- **Bastion:** ein gebrochener Schild löst einen defensiven Impuls aus.
- **Specter:** der erste Angriff nach einem Dash wird zum Phasenschlag.
- **Carrier:** zwei sichtbare Begleitdrohnen greifen automatisch an.

### Modulfunktionen

- **Zielcomputer:** markiert regelmäßig ein Ziel für erhöhten Schaden.
- **Reaktorkondensator:** EMP aktiviert kurz Overdrive.
- **Nanopanzerung:** regeneriert nach einer längeren schadensfreien Phase langsam Hülle.
- **Traktor-Magnet:** eingesammelter Loot verursacht einen kleinen Impuls gegen nahe Gegner.
- **Resonanzverstärker:** verstärkt Plasma-, Lichtbogen- und Explosionsschaden.

### Waffen-Evolutionen

- **Plasma:** hinterlässt ein zeitlich begrenztes Resonanzfeld.
- **Lichtbogen:** springt auf zusätzliche Ziele.
- **Flak:** kann feindliche Projektile abfangen.

## Qualitätsziele

- keine Begrenzung an den sichtbaren Bildschirmrand
- Kamera folgt weich und ohne Sprünge
- Weltgenerierung bleibt bei kurzen und mittleren Runs begrenzt
- bestehende Hangar-, Skill-, Sektor- und Speicherstände werden migriert
- Desktop- und Browser-Smoke-Test prüft Bewegung über mehrere Chunks
- statische Regressionstests sichern Schiffspassiven, Module, Evolutionen und Rendering-Transformationen ab
