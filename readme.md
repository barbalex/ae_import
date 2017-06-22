# arteigenschaften.ch, Import nach PostgreSQL

Diese Anwendung nimmt die Dokumente von [arteigenschaften.ch](https://github.com/FNSKtZH/artendb_v1),<br/>
baut sie für [arteigenschaften.ch Version 2](https://github.com/barbalex/ae2) um<br/>
und importiert sie in eine [PostgreSQL](https://www.postgresql.org) Datenbank.

## So geht's:

Quelldatenbank ist http://localhost:5984/artendb
Zieldatenbank ist postgres://localhost:5432/ae

1. `sql\createDatabase.sql` erstellt PostgreSQL datenbank
1. `rebuildTables` baut die Tabellenstruktur der Datenbank ae auf
1. Danach werden nach und nach die Tabellen mit Daten aus artendb gefüllt

Befehle:

    npm start

Meist meldet PostgreSQL im letzten Schritt einen Deadlock. Daher den letzten Schritt einzeln wiederholen (ev. mehrmals probieren):

    npm run start2
