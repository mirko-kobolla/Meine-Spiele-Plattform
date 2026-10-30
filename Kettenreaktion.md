### Kettenreaktion

- **Status:** In Planung
- **Kategorie:** Denken
- **Kurzbeschreibung:** Auf einem 5x5-Feld setzt man Steine und löst Kettenreaktionen aus, um die Steine des Gegners zu erobern.

#### Spielidee und Ziel

- **Worum geht es?** Auf einem 5x5-Feld spielen zwei Seiten gegeneinander. Wenn ein Feld seine kritische Grenze erreicht, löst es eine Kettenreaktion aus und Steine werden auf umgebende Felder verteilt. Landen Steine auf einem gegnerischen Stapel, wird dieser erobert. Gespielt wird in der ersten Version gegen einen Bot; ein Spiel zu zweit ist für später vorgesehen.
- **Was muss die spielende Person erreichen?** Alle gegnerischen Steine übernehmen.
- **Was macht das Spiel besonders oder unterhaltsam?** Die strategische Komplexität der Kettenreaktionen.

#### Spielablauf

Beschreibe eine typische Runde in wenigen Schritten:

1. Was passiert beim Start? Eine Person spielt gegen einen Bot. Beide Seiten haben einen Dreier-Stapel zum Platzieren; der Gesamtvorrat an Steinen ist unbegrenzt.
2. Was macht die spielende Person? Pro Zug einen Stein auf ein leeres oder eigenes Feld setzen. Direkt auf ein gegnerisches Feld zu setzen ist nicht erlaubt.
3. Wann ist die Runde vorbei? Wenn eine Seite keine Steine ihrer Farbe mehr auf dem Spielfeld hat.
4. Was passiert danach? Ein Ergebnisbildschirm bietet „Nochmal spielen“, eine Änderung der Bot-Schwierigkeit und den Highscore.

#### Regeln und Punkte

- **Steinvorrat:** Beide Seiten haben einen Dreier-Stapel zum Platzieren. Der Gesamtvorrat an Steinen ist unbegrenzt.
- **Kritische Grenze:** In den inneren 3x3 Feldern liegt sie bei 4, in den Ecken bei 2 und an den übrigen Randfeldern bei 3. Wird die Grenze erreicht, löst das Feld aus und Steine werden auf umgebende Felder verteilt.
- **Erobern:** Landet die eigene Farbe auf einem gegnerischen Stapel, wird der ganze Stapel erobert.
- **Punkte oder Rekord:** Spieldauer und Anzahl der eigenen Steine am Spielende werden erfasst.
- **Gewinnen / Verlieren:** Eine Seite gewinnt, wenn die andere keine Steine ihrer Farbe mehr auf dem Spielfeld hat.
- **Bot-Schwierigkeit:** Vor dem Spiel sind die Stufen Einfach, Mittel und Schwer auswählbar.

#### Steuerung

| Aktion | Tastatur | Maus / Touch |
|---|---|---|
| Starten | Tastaturbedienung wird unterstützt | Maus / Touch |
| Spielen | Tastaturbedienung wird unterstützt | Maus / Touch |
| Pause oder Neustart | Tastaturbedienung wird unterstützt | Maus / Touch |

#### Gestaltung und Rückmeldung

- **Stimmung und Stil:**
- **Farben oder wichtige Elemente:** Die Anzahl der Steine auf jedem Feld muss gut erkennbar sein.
- **Rückmeldung bei Aktionen:** Anzeigen, wenn Steine gewonnen oder verloren werden und wenn sich Stapel aufteilen.
- **Barrierefreiheit:** Gibt es Alternativen zu Farbe, Ton oder schneller Eingabe?

#### Umfang der ersten Version

- **Muss enthalten sein:**
  - [ ] Spiel gegen einen Bot mit den Stufen Einfach, Mittel und Schwer.
  - [ ] Spielregeln und Kettenreaktions-Logik.
  - [ ] Ergebnis und Highscore mit Spieldauer und Anzahl eigener Steine.
- **Kann später ergänzt werden:**
  - [ ] Spiel zu zweit.
- **Gehört ausdrücklich nicht zur ersten Version:**
  - [ ]

#### Technische und Plattform-Notizen

- **Einbindung in die Plattform:** Eigene Seite, Dialog oder andere Darstellung?
- **Speicherung:** Spieldauer und Anzahl eigener Steine sollen erfasst werden. Ob und wie Highscores dauerhaft gespeichert werden, ist noch offen.
- **Besondere Anforderungen:** Zum Beispiel Bildschirmgröße, Netzwerk oder Gerätefunktionen. Nein

#### Fertig-Kriterien

- [ ] Die Spielregeln sind im Spiel verständlich erklärt.
- [ ] Start, Spielrunde und Neustart funktionieren.
- [ ] Steuerung funktioniert mit den vorgesehenen Eingabemethoden.
- [ ] Darstellung funktioniert auf Handy und Desktop.
- [ ] Punkte und Spielende verhalten sich wie im Konzept beschrieben.

#### Offene Fragen und Entscheidungen

- **Dreier-Stapel:** Wie wird der Dreier-Stapel nach dem Platzieren eines Steins wieder aufgefüllt? Ist er ein Vorrat für die nächsten drei Züge oder werden Steine laufend nachgefüllt?
- **Verteilung bei einer Kettenreaktion:** Wird das auslösende Feld geleert? Geht je ein Stein auf jedes waagerecht und senkrecht angrenzende Feld, oder auch diagonal?
- **Spielbeginn:** Mit welchen Steinen oder Spielzügen startet die Runde? Wer beginnt?
- **Bot-Stufen:** Welche konkrete Strategie unterscheidet Einfach, Mittel und Schwer?
- **Highscore:** Sollen Spieldauer und eigene Steine als getrennte Rekorde geführt werden? Werden Rekorde nur auf diesem Gerät gespeichert?
- **Tastatursteuerung:** Welche Tasten sollen Felder auswählen und Züge bestätigen?
- **Gestaltung und Barrierefreiheit:** Welcher visuelle Stil ist gewünscht, und sollen Spielsteine zusätzlich zu Farben unterscheidbare Symbole haben?

#### Änderungsverlauf

- 2026-10-30: Konzept erstellt, offene Fragen ergänzt und Spielregeln anhand der Antworten konkretisiert.
