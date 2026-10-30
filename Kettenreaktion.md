### Kettenreaktion

- **Status:** Erster Entwurf umgesetzt
- **Kategorie:** Denken
- **Kurzbeschreibung:** Auf einem 5x5-Feld setzt man Steine und löst Kettenreaktionen aus, um die Steine des Gegners zu erobern.

#### Spielidee und Ziel

- **Worum geht es?** Auf einem 5x5-Feld spielen zwei Seiten gegeneinander. Wenn ein Feld seine kritische Grenze erreicht, löst es eine Kettenreaktion aus und Steine werden auf umgebende Felder verteilt. Landen Steine auf einem gegnerischen Stapel, wird dieser erobert. Gespielt wird in der ersten Version gegen einen Bot; ein Spiel zu zweit ist für später vorgesehen.
- **Was muss die spielende Person erreichen?** Alle gegnerischen Steine übernehmen.
- **Was macht das Spiel besonders oder unterhaltsam?** Die strategische Komplexität der Kettenreaktionen.

#### Spielablauf

Beschreibe eine typische Runde in wenigen Schritten:

1. Was passiert beim Start? Eine Person wählt ihr Startfeld in der mittleren 3x3-Zone. Der Bot erhält zufällig ein anderes, nicht angrenzendes Feld. Beide Seiten starten dort mit einem Stapel aus drei Steinen. Vor der Runde kann die Person auswählen, wer den ersten Zug macht. Danach ist der Steinvorrat unbegrenzt.
2. Was macht die spielende Person? Pro Zug einen Stein auf ein leeres oder eigenes Feld setzen. Direkt auf ein gegnerisches Feld zu setzen ist nicht erlaubt.
3. Wann ist die Runde vorbei? Wenn eine Seite keine Steine ihrer Farbe mehr auf dem Spielfeld hat.
4. Was passiert danach? Ein Ergebnisbildschirm bietet „Nochmal spielen“, eine Änderung der Bot-Schwierigkeit und den Highscore.

#### Regeln und Punkte

- **Startsteine:** Jede Seite startet mit drei Steinen gemeinsam auf einem Feld. Die Startfelder und wer beginnt, werden vor der Runde festgelegt. Danach ist der Steinvorrat unbegrenzt.
- **Kritische Grenze:** In den inneren 3x3 Feldern liegt sie bei 4, in den Ecken bei 2 und an den übrigen Randfeldern bei 3. Erreicht ein Feld seine kritische Grenze, wird es geleert und je ein Stein wird waagerecht oder senkrecht auf ein angrenzendes Feld verteilt. Diagonale Felder zählen nicht als Nachbarn.
- **Erobern:** Landet die eigene Farbe auf einem gegnerischen Stapel, wird der ganze Stapel erobert.
- **Punkte oder Rekord:** Der Endpunktestand ist die Anzahl der eigenen Steine am Spielende plus die Anzahl aller Züge im Spiel. Ein höherer Punktestand ist besser.
- **Gewinnen / Verlieren:** Eine Seite gewinnt, wenn die andere keine Steine ihrer Farbe mehr auf dem Spielfeld hat.
- **Bot-Schwierigkeit:** Vor dem Spiel sind die Stufen Einfach, Mittel und Schwer auswählbar. Einfach wählt zufällig, Mittel bewertet mögliche Züge und Kettenreaktionen, Schwer berücksichtigt zusätzlich eine mögliche Antwort der spielenden Person.
- **Kein möglicher Zug:** Hat eine Seite kein leeres oder eigenes Feld mehr, verliert sie.

#### Steuerung

| Aktion | Tastatur | Maus / Touch |
|---|---|---|
| Starten | Tastaturbedienung wird unterstützt | Maus / Touch |
| Spielen | Nicht vorgesehen | Maus / Touch |
| Pause oder Neustart | Nicht vorgesehen | Maus / Touch |

#### Gestaltung und Rückmeldung

- **Stimmung und Stil:** Dunkles Spielfeld passend zum Pixelpause-Entwurf.
- **Farben oder wichtige Elemente:** Die Anzahl der Steine auf jedem Feld muss gut erkennbar sein.
- **Rückmeldung bei Aktionen:** Die Anzahl der Steine auf jedem Stapel muss erkennbar sein. Anzeigen, wenn Steine gewonnen oder verloren werden und wenn sich Stapel aufteilen.
- **Barrierefreiheit:** Gibt es Alternativen zu Farbe, Ton oder schneller Eingabe?

#### Umfang der ersten Version

- **Muss enthalten sein:**
  - [x] Spiel gegen einen Bot mit den Stufen Einfach, Mittel und Schwer.
  - [x] Spielregeln und Kettenreaktions-Logik.
  - [x] Ergebnis und Highscore mit eigener Steinzahl und Anzahl aller Züge.
  - [x] Startspieler-Auswahl und Startaufstellung.
- **Kann später ergänzt werden:**
  - [ ] Spiel zu zweit.
- **Gehört ausdrücklich nicht zur ersten Version:**
  - [ ]

#### Technische und Plattform-Notizen

- **Einbindung in die Plattform:** Eigene Spieleseite.
- **Speicherung:** Der Punktestand ist eigene Steine am Ende plus Anzahl aller Züge. Die fünf besten Ergebnisse werden zusammen mit Ergebnis, Steinzahl, Zügen und Datum lokal auf diesem Gerät gespeichert.
- **Besondere Anforderungen:** Zum Beispiel Bildschirmgröße, Netzwerk oder Gerätefunktionen. Nein

#### Fertig-Kriterien

- [x] Die Spielregeln sind im Spiel verständlich erklärt.
- [x] Start, Spielrunde und Neustart funktionieren.
- [x] Steuerung funktioniert mit den vorgesehenen Eingabemethoden.
- [x] Darstellung funktioniert auf Handy und Desktop.
- [x] Punkte und Spielende verhalten sich wie im Konzept beschrieben.

#### Offene Fragen und Entscheidungen

- Die Bot-Stufen sind zunächst einfache Strategien und können nach den ersten Spieltests angepasst werden.

#### Änderungsverlauf

- 2026-10-30: Konzept erstellt, Regeln und Highscore-Formel konkretisiert und den ersten spielbaren Entwurf umgesetzt.
