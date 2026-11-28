### Wall Go

- **Status:** In Umsetzung
- **Kategorie:** Denken
- **Kurzbeschreibung:** Ein rundenbasiertes taktisches Brettspiel, bei dem du Spielfiguren über ein 7×7-Raster ziehst und Mauern baust, um das größte eigene Gebiet abzugrenzen.

#### Spielidee und Ziel

- **Worum geht es?** Zwei bis vier Parteien bewegen ihre Figuren über ein quadratisches Spielfeld (7×7 Felder) und errichten nach jedem Zug eine Mauer an einer angrenzenden Feldkante.
- **Was muss die spielende Person erreichen?** Durch geschicktes Platzieren von Mauern müssen zusammenhängende Bereiche vollständig eingeschlossen werden, in denen sich ausschließlich eigene Spielfiguren befinden.
- **Was macht das Spiel besonders oder unterhaltsam?** Jede gesetzte Mauer blockiert alle Figuren – auch die eigenen. Man muss vorausschauend planen, um Gegner einzusperren, ohne sich selbst wertvollen Platz abzuschneiden.

#### Spielablauf

Beschreibe eine typische Runde in wenigen Schritten:

1. **Start:** Vor Spielbeginn werden Spielmodus, Bot-Schwierigkeit und die Startaufstellung (vorgegebene Positionen oder abwechselndes freies Platzieren) gewählt. Das 7×7-Spielfeld wird aufgebaut und jede Seite erhält 4 Figuren (im 3- bis 4-Spieler-Modus je 2 Figuren) sowie 20 bis 25 Mauersegmente.
2. **Spielzug:** Wer am Zug ist, wählt eine eigene Figur, zieht sie um 0, 1 oder 2 Felder waagerecht oder senkrecht (gerade oder um die Ecke, aber nicht durch Mauern oder über besetzte Felder) und baut anschließend zwingend eine Mauer an einer der vier Kanten des Zielfeldes.
3. **Rundenende:** Das Spiel endet, sobald alle Spielfiguren durch Mauern vollständig voneinander getrennt sind, sodass keine Figur mehr das Gebiet einer gegnerischen Figur erreichen kann (oder alle Mauern aufgebraucht sind).
4. **Auswertung:** Erst am Spielende werden alle komplett ummauerten Bereiche gezählt und gewertet. Enthält ein Bereich nur Figuren einer einzigen Partei, erhält diese 1 Punkt pro Feld in diesem Gebiet. Neutrale (leere) oder umkämpfte Bereiche geben 0 Punkte (Ausnahme: Sind Figuren verschiedener Parteien komplett bewegungsunfähig zusammen eingesperrt, zählt nur das jeweilige Standfeld). Wer die meisten Punkte hat, gewinnt.

#### Regeln und Punkte

- **Regeln:**
  - Startaufstellung: Vor dem Match wählbar zwischen festen Startpositionen und abwechselndem freien Setzen auf dem Brett.
  - Bewegung: 0 bis 2 Schritte orthogonal (kein Überspringen von Figuren oder Mauern). 0 Schritte bedeutet, die Figur bleibt stehen und baut direkt eine Mauer an ihrem aktuellen Feld.
  - Mauerbau: Nach jeder Bewegung muss genau eine Mauer an einer freien Kante des Zielfeldes platziert werden. Der äußere Spielfeldrand gilt bereits als Mauer.
  - Sonderregel (3–4 Personen): Jede Person darf einmal pro Partie einen „Wallbreaker“ einsetzen, um eine bestehende Mauer einzureißen, anstatt eine neue zu bauen.
- **Punkte oder Rekord:** 1 Punkt pro eingeschlossenem Feld im eigenen Territorium. Die Punkteauswertung erfolgt erst am Ende der Partie (keine Live-Punkteanzeige während des Spiels). Gewonnene Partien oder die größte eroberte Fläche können als Highscore gespeichert werden.
- **Gewinnen / Verlieren:** Das Spiel endet durch vollständige Isolation aller Figuren. Die Person mit den meisten Gebietspunkten gewinnt. Bei Gleichstand gewinnt die Partei mit dem größten zusammenhängenden Einzelgebiet (falls auch das gleich ist, endet die Partie unentschieden).
- **Schwierigkeitsverlauf:** Im Mehrspieler-Modus hängt die Schwierigkeit von den Mitspielenden ab; gegen den Bot lässt sich der Schwierigkeitsgrad (z. B. Leicht, Mittel, Schwer) vorab im Startmenü wählen.

#### Steuerung

| Aktion | Tastatur | Maus / Touch |
|---|---|---|
| Starten | `Enter` / `Leertaste` | Klick / Tippen auf „Spiel starten“ |
| Spielen | Pfeiltasten / `WASD` (Figur/Feld wählen), `Leertaste` (Bestätigen) | Klick / Tippen auf Figur -> Zielfeld -> gewünschte Feldkante für Mauer |
| Pause oder Neustart | `Esc` / `P` (Menü/Pause), `R` (Neustart) | Klick / Tippen auf Pause- oder Neustart-Symbol |

#### Gestaltung und Rückmeldung

- **Stimmung und Stil:** Minimalistisch, klar strukturiert und modern (angelehnt an abstrakte Strategiespiele wie Go oder Quoridor).
- **Farben oder wichtige Elemente:** Hoher Kontrast zwischen Spielfeld (helles/dunkles Raster), den Spielfiguren (z. B. Blau vs. Rot/Orange) und den gesetzten Mauern (deutlich hervorgehobene Balken). Gültige Zielfelder und mögliche Mauer-Kanten werden im aktuellen Zug farblich markiert.
- **Rückmeldung bei Aktionen:** Sanfte Gleit-Animation beim Ziehen der Figuren, kurzes Einrast-Geräusch und visuelles Aufleuchten beim Setzen einer Mauer. Erst bei der Endauswertung färben sich alle eroberten Gebiete in der Farbe der jeweiligen Partei ein.
- **Barrierefreiheit:** Unterschiedliche Formen oder Symbole für die Spielfiguren (nicht nur Farben), deutliche visuelle Markierungen zusätzlich zu Soundeffekten und kein Zeitdruck (Zug-Timer standardmäßig deaktiviert).

#### Umfang der ersten Version

- **Muss enthalten sein:**
  - [ ] 7×7-Spielfeld mit korrekter Bewegungs- und Mauerbau-Logik
  - [ ] Startmenü mit Auswahl für Startaufstellung (vorgegeben vs. frei setzen) und Bot-Schwierigkeitsstufe
  - [ ] Automatische Erkennung abgeschlossener Gebiete (Flood-Fill-Algorithmus) und Endauswertung inklusive Tie-Breaker (größtes Einzelgebiet)
  - [ ] Lokaler 2-Spieler-Modus an einem Gerät (Pass & Play) sowie Einzelspieler gegen Bot
  - [ ] Kurze, bebilderte Regelübersicht im Spiel
- **Kann später ergänzt werden:**
  - [x] 3- und 4-Spieler-Modus inklusive „Wallbreaker“-Sonderaktion
  - [x] Optionaler Zug-Timer (z. B. 60 oder 90 Sekunden pro Zug)
- **Gehört ausdrücklich nicht zur ersten Version:**
  - [ ] Live-Punkteanzeige während der laufenden Partie

#### Technische und Plattform-Notizen

- **Einbindung in die Plattform:** Eigenständige Spielansicht mit zentriertem Spielfeld und kompaktem Status-Header (aktueller Zug, verbleibende Mauern).
- **Speicherung:** Lokale Speicherung (`LocalStorage`) für Einstellungen (Sound an/aus, Theme, bevorzugte Startaufstellung) sowie einfache Statistiken (gespielte/gewonnene Partien).
- **Besondere Anforderungen:** Responsive Layout, damit das quadratische 7×7-Brett sowohl auf breiten Desktop-Bildschirmen als auch im Hochformat auf Smartphones gut bedienbar bleibt (ausreichend große Touch-Flächen für die Feldkanten).

#### Fertig-Kriterien

- [ ] Die Spielregeln sind im Spiel verständlich erklärt.
- [ ] Start (inklusive Optionen für Aufstellung und Bot), Spielrunde und Neustart funktionieren.
- [ ] Steuerung funktioniert mit den vorgesehenen Eingabemethoden.
- [ ] Darstellung funktioniert auf Handy und Desktop.
- [ ] Punkte, Tie-Breaker und Spielende verhalten sich wie im Konzept beschrieben.

#### Offene Fragen und Entscheidungen

- Keine offenen Fragen für die erste Version (alle Kernentscheidungen sind getroffen).

#### Änderungsverlauf

- 2026-11-26: Erste spielbare Browser-Umsetzung für 2 Spieler und Bot begonnen.
- 2026-11-26: Konzept erstellt und Startoptionen, Auswertungszeitpunkt sowie Tie-Breaker-Regel festgelegt.
