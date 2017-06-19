'use strict'

const _ = require('lodash')

module.exports = pgDb =>
  new Promise((resolve, reject) => {
    let propertyCollections
    let gisLayerPc
    let jahresartenPc
    let schutzPc
    /**
     * 1. combine all GIS-Layer
     */
    pgDb
      .any(
        `
      SELECT
        *
      FROM
        ae.property_collection`
      )
      .then(data => {
        propertyCollections = data
        // 1.1 prepare data
        const gisLayerCollections = propertyCollections.filter(
          pC => pC.name === 'ZH GIS'
        )
        const gisLayerIds = gisLayerCollections.map(c => c.id)
        gisLayerPc = {
          name: 'ZH GIS',
          description:
            'GIS-Layer und Betrachtungsdistanzen für das Artenlistentool, Artengruppen für EvAB, im Kanton Zürich. Eigenschaften aller Arten',
          links: '{"http://www.naturschutz.zh.ch"}',
          combining: false,
          organization_id: gisLayerCollections[0].organization_id,
          last_updated: '2016.06.01',
          terms_of_use:
            'Open Data: Die veröffentlichten Daten dürfen mit Hinweis auf die Quelle vervielfältigt, verbreitet und weiter zugänglich gemacht, angereichert und bearbeitet sowie kommerziell genutzt werden. Für die Richtigkeit, Genauigkeit, Zuverlässigkeit und Vollständigkeit der bezogenen, ebenso wie der daraus erzeugten Daten und anderer mit Hilfe dieser Daten hergestellten Produkte wird indessen keine Haftung übernommen.',
          imported_by: gisLayerCollections[0].imported_by,
        }
        // 1.2 remove existing collections
        return pgDb.any(`
          DELETE FROM ae.property_collection
          WHERE id IN ('${gisLayerIds.join(`','`)}')
        `)
      })
      // 1.3 add a new one instead
      .then(() =>
        pgDb.any(`
        INSERT INTO ae.property_collection (${_.keys(gisLayerPc).join(`,`)})
        VALUES ('${_.values(gisLayerPc).join("','").replace(/'',/g, 'null,')}')
      `)
      ) /* eslint quotes:0 */
      /**
       * 2. combine ZH Jahresarten
       */
      .then(() => {
        // 2.1 prepare data
        const jahresartenCollections = propertyCollections.filter(
          pC => pC.name === 'ZH Jahresarten'
        )
        const jahresartenIds = jahresartenCollections.map(c => c.id)
        jahresartenPc = {
          name: 'ZH Jahresarten',
          description: 'Jahresarten im Kanton Zürich',
          links: '{"http://www.naturschutz.zh.ch"}',
          combining: false,
          organization_id: jahresartenCollections[0].organization_id,
          last_updated: '2007.01.01',
          terms_of_use:
            'Open Data: Die veröffentlichten Daten dürfen mit Hinweis auf die Quelle vervielfältigt, verbreitet und weiter zugänglich gemacht, angereichert und bearbeitet sowie kommerziell genutzt werden. Für die Richtigkeit, Genauigkeit, Zuverlässigkeit und Vollständigkeit der bezogenen, ebenso wie der daraus erzeugten Daten und anderer mit Hilfe dieser Daten hergestellten Produkte wird indessen keine Haftung übernommen.',
          imported_by: jahresartenCollections[0].imported_by,
        }
        // 2.2 remove existing collections
        return pgDb.any(`
          DELETE FROM ae.property_collection
          WHERE id IN ('${jahresartenIds.join(`','`)}')
        `)
      })
      // 2.3 add a new one instead
      .then(() =>
        pgDb.any(`
        INSERT INTO ae.property_collection (${_.keys(jahresartenPc).join(`,`)})
        VALUES ('${_.values(jahresartenPc)
          .join("','")
          .replace(/'',/g, 'null,')}')
      `)
      ) /* eslint quotes:0 */
      /**
       * 2. combine FNS Schutz (2009)
       */
      .then(() => {
        // 2.1 prepare data
        const schutzCollections = propertyCollections.filter(
          pC => pC.name === 'FNS Schutz (2009)'
        )
        const schutzIds = schutzCollections.map(c => c.id)
        schutzPc = {
          name: schutzCollections[0].name,
          description: schutzCollections[0].description,
          links: schutzCollections[0].links,
          combining: schutzCollections[0].combining,
          organization_id: schutzCollections[0].organization_id,
          last_updated: schutzCollections[0].last_updated,
          terms_of_use: schutzCollections[0].terms_of_use,
          imported_by: schutzCollections[0].imported_by,
        }
        // 2.2 remove existing collections
        return pgDb.any(`
          DELETE FROM ae.property_collection
          WHERE id IN ('${schutzIds.join(`','`)}')
        `)
      })
      // 2.3 add a new one instead
      .then(() =>
        pgDb.any(`
        INSERT INTO ae.property_collection (${_.keys(schutzPc).join(`,`)})
        VALUES ('${_.values(schutzPc).join("','").replace(/'',/g, 'null,')}')
      `)
      ) /* eslint quotes:0 */
      .then(() => {
        console.log('corrected some property collections')
        resolve()
      })
      .catch(error => reject(error))
  })
