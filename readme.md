#arteigenschaften.ch, Strukturanpassung

Diese Anwendung nimmt die Dokumente von arteigenschaften.ch (Version 2),<br/>
baut sie für arteigenschaften.ch Version 3 um<br/>
und importiert sie in eine PostgreSQL Datenbank:

### Neu ist:

- Es gibt Objekte vom Typ "Taxonomie"
- Es gibt Objekte vom Typ "Taxonomie-Objekt"
- In Objekten gibt es keine Taxonomien mehr

### Struktur von Objekten des Typs "Taxonomie"

	_id
	_rev
	Gruppe
	Typ: Taxonomie
	Name
	Beschreibung
	Datenstand
	Link
	Standardtaxonomie
	Organisation mit Schreibrecht

### Struktur von Objekten des Typs "Taxonomie-Objekt"
	
	_id
	_rev
	Typ: Taxonomie-Objekt
	Taxonomie: _id der Taxonomie
	Name
	Objekt
	  id
	  Eigenschaften
		… (abhängig von der Taxonomie)
	parent (null für oberste Ebene)

### neue Struktur von Objekten des Typs "Objekt":

    _id
    _rev
    Gruppe
    Typ: Objekt
    Eigenschaftensammlungen
    Beziehungssammlungen

Jedes Objekt, jede Eigenschaften- und Beziehungssammlung erhalten neu: "Organisation mit Schreibrecht": "FNS Kt. ZH"