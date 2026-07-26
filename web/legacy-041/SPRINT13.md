# Sprint 0.13 — Outer Frontier

Sprint 0.13 macht die Entfernung vom Ursprung zu einer echten Progressionsachse. Je weiter der Pilot in den Deep Space vordringt, desto wertvoller, gefährlicher und mechanisch abwechslungsreicher wird die Welt.

## Distanzzonen

- **Grenzraum** ab 0 m: Asteroiden, verlassene Stationen und bekannte Gegner.
- **Tiefer Raum** ab 1.500 m: Handelsposten, Signalbaken, Jäger und Scharfschützen.
- **Leere** ab 3.200 m: Bergungstresore, Gravitationsanomalien, Minenleger und Schildwächter.
- **Abgrund** ab 5.500 m: Sprungrisse, Phasenjäger, höchste Belohnungen und das vollständige Boss-Arsenal.

Das HUD zeigt die aktuelle Zone sowie die Entfernung bis zur nächsten Freischaltung.

## Neue Entdeckungen

- **Handelsposten:** Missions-Credits werden in run-lange Buffs investiert. Angeboten werden Waffen-Overclock, Aegis-Schild, Naniten, Vektorschub, Bergungsvertrag und Bossjäger-Protokoll.
- **Signalbaken:** kurze Scans verbessern Radar und Reichweite und zahlen Missions-Credits aus.
- **Bergungstresore:** bewachte Hochwertziele mit Credits, Tech-Kernen und zusätzlichen Gegnerwellen.
- **Gravitationsanomalien:** riskante, zufällige Schiffsmodifikationen mit starken Run-Boni.
- **Sprungrisse:** transportieren den Piloten weiter nach außen, lösen aber unmittelbar eine gefährliche Begegnung aus.

## Neue Gegner

- **Frontier Hunter:** aggressive Dash-Angriffe.
- **Null Sniper:** hält Distanz und feuert langsame, stark telegraphierte Präzisionsschüsse.
- **Mine Layer:** kontrolliert Raum mit zeitlich begrenzten Minen.
- **Aegis Sentinel:** besitzt einen regenerierenden Frontschild.
- **Phase Stalker:** versetzt sich regelmäßig in eine neue Angriffsposition.

Die Auswahl berücksichtigt Distanzzone, Welle und Laufzeit. Bekannte Gegner verschwinden nicht, werden aber zunehmend durch komplexere Kombinationen ergänzt.

## Bossvarianten

- **Frontier Warden:** ausgewogener Einstieg.
- **Siege Warden:** langsam, stark gepanzert, radiale Salven; verlangt Mobilität und Durchdringung.
- **Carrier Prime:** beschwört Verbände; Flächenschaden und Zielpriorisierung sind entscheidend.
- **Void Hunter:** schnelle Dash- und Fächerangriffe; verlangt Ausweich-Timing.
- **Rift Architect:** erzeugt rotierende Schussmuster und Minenfelder; verlangt Raumkontrolle.

Boss-Lebenspunkte, Schaden, Angriffstempo und Belohnung skalieren gemeinsam mit Welle, Laufzeit und maximal erreichter Distanz.

## Qualität und Kompatibilität

- bestehende Spielstände bleiben kompatibel
- alle Buffs gelten ausschließlich im aktuellen Run
- Chunk-, Gegner-, Projektil- und Partikelgrenzen bleiben erhalten
- deterministische Test-Hooks prüfen Distanzzonen, Entdeckungen, Handel, Gegnerfreischaltung und Bossauswahl
- Browser-Smoke-Test prüft weiterhin Hangar, Spielstart, Bewegung und Pause
