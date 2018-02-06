'use strict'

const _ = require('lodash')

const openDataTerms = require('./openDataTerms')

module.exports = async pgDb => {
  /**
   * 1. combine all GIS-Layer
   */
  const propertyCollections = await pgDb.any(
    'SELECT * FROM ae.property_collection'
  )
  // 1.1 prepare data
  const gisLayerCollections = propertyCollections.filter(
    pC => pC.name === 'ZH GIS'
  )
  const gisLayerIds = gisLayerCollections.map(c => c.id)
  const gisLayerPc = {
    name: 'ZH GIS',
    description: `GIS-Layer und Betrachtungsdistanzen für das Artenlistentool,
      Artengruppen für EvAB, im Kanton Zürich. Eigenschaften aller Arten`,
    links: '{"http://www.naturschutz.zh.ch"}',
    combining: false,
    organization_id: gisLayerCollections[0].organization_id,
    last_updated: '2016.06.01',
    terms_of_use: openDataTerms,
    imported_by: gisLayerCollections[0].imported_by,
  }
  // 1.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.property_collection
    WHERE id IN ('${gisLayerIds.join(`','`)}')
  `)
  // 1.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.property_collection (${_.keys(gisLayerPc).join(`,`)})
    VALUES ('${_.values(gisLayerPc)
      .join("','")
      .replace(/'',/g, 'null,')}')
  `)

  /**
   * 2. combine ZH Jahresarten
   */
  // 2.1 prepare data
  const jahresartenCollections = propertyCollections.filter(
    pC => pC.name === 'ZH Jahresarten'
  )
  const jahresartenIds = jahresartenCollections.map(c => c.id)
  const jahresartenPc = {
    name: 'ZH Jahresarten',
    description: 'Jahresarten im Kanton Zürich',
    links: '{"http://www.naturschutz.zh.ch"}',
    combining: false,
    organization_id: jahresartenCollections[0].organization_id,
    last_updated: '2007.01.01',
    terms_of_use: openDataTerms,
    imported_by: jahresartenCollections[0].imported_by,
  }
  // 2.2 remove existing collections
  await pgDb.any(`
   DELETE FROM ae.property_collection
   WHERE id IN ('${jahresartenIds.join(`','`)}')
 `)
  // 2.3 add a new one instead
  await pgDb.any(`
   INSERT INTO ae.property_collection (${_.keys(jahresartenPc).join(`,`)})
   VALUES ('${_.values(jahresartenPc)
     .join("','")
     .replace(/'',/g, 'null,')}')
 `)
  /**
   * 3. combine FNS Schutz (2009)
   */
  // 3.1 prepare data
  const schutzCollections = propertyCollections.filter(
    pC => pC.name === 'FNS Schutz (2009)'
  )
  const schutzIds = schutzCollections.map(c => c.id)
  const schutzPc = {
    name: schutzCollections[0].name,
    description: schutzCollections[0].description,
    links: schutzCollections[0].links,
    combining: schutzCollections[0].combining,
    organization_id: schutzCollections[0].organization_id,
    last_updated: schutzCollections[0].last_updated,
    terms_of_use: schutzCollections[0].terms_of_use,
    imported_by: schutzCollections[0].imported_by,
  }
  // 3.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.property_collection
    WHERE id IN ('${schutzIds.join(`','`)}')
  `)
  // 3.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.property_collection (${_.keys(schutzPc).join(`,`)})
    VALUES ('${_.values(schutzPc)
      .join("','")
      .replace(/'',/g, 'null,')}')
  `)

  /**
   * 4. combine all RL aktuell
   */
  const collections = await pgDb.any('SELECT * FROM ae.property_collection')
  // 4.1 prepare data
  const rlCollections = collections.filter(
    pC => pC.name === 'CH Rote Liste (aktuell)'
  )
  const rlIds = rlCollections.map(c => c.id)
  const rlPc = {
    name: 'CH Rote Liste (aktuell)',
    description:
      'Zusammenfassung aller Roten Listen aus allen Artgruppen (pro Art jeweils die neusten Informationen)',
    links:
      '{http://www.bafu.admin.ch/biodiversitaet/10372/10393/index.html?lang=de}',
    combining: true,
    organization_id: 'a8e5bc98-696f-11e7-b453-3741aafa0388',
    last_updated: '2014-05-20',
    terms_of_use:
      'Importiert mit Einverständnis des Autors. Eine allfällige Weiterverbreitung ist nur mit dessen Zustimmung möglich.',
    imported_by: 'a8eeeaa2-696f-11e7-b454-83e34acbe09f',
  }
  // 4.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.property_collection
    WHERE id IN ('${rlIds.join(`','`)}')
  `)
  // 4.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.property_collection (${_.keys(rlPc).join(`,`)})
    VALUES ('${_.values(rlPc)
      .join("','")
      .replace(/'',/g, 'null,')}')
  `)

  /**
   * 5. combine all ZH Artwert (aktuell)
   */
  // 5.1 prepare data
  const zhAwCollections = collections.filter(
    pC => pC.name === 'ZH Artwert (aktuell)'
  )
  const zhAwIds = zhAwCollections.map(c => c.id)
  const zhAwPc = {
    name: 'ZH Artwert (aktuell)',
    description:
      'Artwerte für den Kanton Zürich. Eigenschaften von 1257 Tierarten und 1689 Pflanzenarten. Zusammenfassende Eigenschaftensammlung: enthält Daten von "ZH Artwert (2000)" und "ZH Artwert aus AP Flachmoore (2009)"',
    links: '{http://naturschutz.zh.ch}',
    combining: true,
    organization_id: 'a8e5bc98-696f-11e7-b453-3741aafa0388',
    last_updated: '2009-01-01',
    terms_of_use: openDataTerms,
    imported_by: 'a8eeeaa2-696f-11e7-b454-83e34acbe09f',
  }
  // 5.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.property_collection
    WHERE id IN ('${zhAwIds.join(`','`)}')
  `)
  // 5.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.property_collection (${_.keys(zhAwPc).join(`,`)})
    VALUES ('${_.values(zhAwPc)
      .join("','")
      .replace(/'',/g, 'null,')}')
  `)
  console.log('corrected some property collections')
}
