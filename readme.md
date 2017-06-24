# arteigenschaften.ch, Import nach PostgreSQL

Diese Anwendung nimmt die Dokumente von [arteigenschaften.ch](https://github.com/FNSKtZH/artendb_v1),<br/>
baut sie für [arteigenschaften.ch Version 2](https://github.com/barbalex/ae2) um<br/>
und importiert sie in eine [PostgreSQL](https://www.postgresql.org) Datenbank.

## So geht's:

- Quelldatenbank ist http://localhost:5984/artendb
- Zieldatenbank ist postgres://localhost:5432/ae
- `rebuildTables` baut die Tabellenstruktur der Datenbank neu auf
- Danach werden nach und nach die Tabellen mit Daten aus artendb gefüllt
- Synonyme Flora wird direkt vom SISF-2-Export der Info Flora importiert

Import ausführen:

1. CouchDB `artendb` lokal replizieren
1. PostgreSQL Datenbank aus früherem Backup erstellen
1. `npm start`
