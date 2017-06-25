'use strict'

const _ = require('lodash')

const links =
  '{"http://www.infoflora.ch/de/daten-beziehen/standard-artenliste.html"}'
const description = `D. Aeschimann & C. Heitz: Synonymie-Index der
  Schweizer Flora (2005). Zweite Auflage. Eigenschaften von 7973 Pflanzenarten.
  Arten mit NR > 1000000 von der FNS provisorisch ergänzt`
const lastUpdated = '2007.05.08'

module.exports = async pgDb => {
  /**
   * 1. combine all "SISF Index 2 (2005): eingeschlossen in"
   */
  const relationCollections = await pgDb.any(
    'SELECT * FROM ae.relation_collection'
  )
  // 1.1 prepare data
  const eingInCollections = relationCollections.filter(
    pC => pC.name === 'SISF Index 2 (2005): eingeschlossen in'
  )
  const eingInIds = eingInCollections.map(c => c.id)
  const eingInRc = {
    name: eingInCollections[0].name,
    description,
    links,
    combining: eingInCollections[0].combining,
    organization_id: eingInCollections[0].organization_id,
    last_updated: lastUpdated,
    terms_of_use: eingInCollections[0].terms_of_use,
    imported_by: eingInCollections[0].imported_by,
    nature_of_relation: eingInCollections[0].nature_of_relation,
    taxonomic: eingInCollections[0].taxonomic,
  }
  // 1.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.relation_collection
    WHERE id IN ('${eingInIds.join(`','`)}')
  `)
  // 1.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.relation_collection (${_.keys(eingInRc).join(`,`)})
    VALUES ('${_.values(eingInRc).join("','").replace(/'',/g, 'null,')}')
  `)

  /**
   * 2. combine all "SISF Index 2 (2005): gültige Namen"
   */
  // 2.1 prepare data
  const gueltNamCollections = relationCollections.filter(
    pC => pC.name === 'SISF Index 2 (2005): gültige Namen'
  )
  const gueltNamIds = gueltNamCollections.map(c => c.id)
  const gueltNamRc = {
    name: gueltNamCollections[0].name,
    description,
    links,
    combining: gueltNamCollections[0].combining,
    organization_id: gueltNamCollections[0].organization_id,
    last_updated: lastUpdated,
    terms_of_use: gueltNamCollections[0].terms_of_use,
    imported_by: gueltNamCollections[0].imported_by,
    nature_of_relation: gueltNamCollections[0].nature_of_relation,
    taxonomic: gueltNamCollections[0].taxonomic,
  }
  // 2.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.relation_collection
    WHERE id IN ('${gueltNamIds.join(`','`)}')
  `)
  // 2.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.relation_collection (${_.keys(gueltNamRc).join(`,`)})
    VALUES ('${_.values(gueltNamRc).join("','").replace(/'',/g, 'null,')}')
  `)

  /**
   * 3. combine all "SISF Index 2 (2005): offizielle Art"
   */
  // 3.1 prepare data
  const offArtCollections = relationCollections.filter(
    pC => pC.name === 'SISF Index 2 (2005): offizielle Art'
  )
  const offArtIds = offArtCollections.map(c => c.id)
  const offArtRc = {
    name: offArtCollections[0].name,
    description,
    links,
    combining: offArtCollections[0].combining,
    organization_id: offArtCollections[0].organization_id,
    last_updated: lastUpdated,
    terms_of_use: offArtCollections[0].terms_of_use,
    imported_by: offArtCollections[0].imported_by,
    nature_of_relation: offArtCollections[0].nature_of_relation,
    taxonomic: offArtCollections[0].taxonomic,
  }
  // 3.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.relation_collection
    WHERE id IN ('${offArtIds.join(`','`)}')
  `)
  // 3.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.relation_collection (${_.keys(offArtRc).join(`,`)})
    VALUES ('${_.values(offArtRc).join("','").replace(/'',/g, 'null,')}')
  `)

  /**
   * 4. combine all "SISF Index 2 (2005): synonym"
   */
  // 4.1 prepare data
  const synCollections = relationCollections.filter(
    pC => pC.name === 'SISF Index 2 (2005): synonym'
  )
  const synIds = synCollections.map(c => c.id)
  const synRc = {
    name: synCollections[0].name,
    description,
    links,
    combining: synCollections[0].combining,
    organization_id: synCollections[0].organization_id,
    last_updated: lastUpdated,
    terms_of_use: synCollections[0].terms_of_use,
    imported_by: synCollections[0].imported_by,
    nature_of_relation: synCollections[0].nature_of_relation,
    taxonomic: synCollections[0].taxonomic,
  }
  // 4.2 remove existing collections
  await pgDb.any(`
    DELETE FROM ae.relation_collection
    WHERE id IN ('${synIds.join(`','`)}')
  `)
  // 4.3 add a new one instead
  await pgDb.any(`
    INSERT INTO ae.relation_collection (${_.keys(synRc).join(`,`)})
    VALUES ('${_.values(synRc).join("','").replace(/'',/g, 'null,')}')
  `)
  console.log('corrected some relation collections')
}
