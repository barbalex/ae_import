'use strict'
/* eslint camelcase:0 */

const _ = require(`lodash`)

/**
 * TODO: correct property name part "Mitelland" to "Mittelland"
 */
/**
 * correct for:
 * if (name === `Schutz` && description === `Informationen zu 54 Lebensräumen`) {
     name = `FNS Schutz (2009)`
   }
 */

module.exports = (pgDb, objects) =>
  new Promise((resolve, reject) => {
    let propertyCollections
    let relationCollections
    const objectPropertyCollections = []
    const objectRelationCollections = []
    const relations = []
    const relationPartners = []

    pgDb.any(`SELECT * FROM ae.property_collection`)
      .then((data) => {
        propertyCollections = data
        return pgDb.any(`Select * from ae.relation_collection`)
      })
      .then((data) => {
        relationCollections = data
        objects.forEach((object) => {
          const pCs = object.Eigenschaftensammlungen
          if (pCs) {
            pCs.forEach((pC) => {
              // add object_property_collection
              const object_id = object._id
              let property_collection_id = propertyCollections.find((c) => c.name === pC.Name)
              if (pC.Name === `Schutz` && pC.Beschreibung === `Informationen zu 54 Lebensräumen`) {
                property_collection_id = propertyCollections.find((c) => c.name === `FNS Schutz (2009)`)
              }
              objectPropertyCollections.push({ object_id, property_collection_id })
            })
          }
          const rCs = object.Beziehungssammlungen
          if (rCs) {
            rCs.forEach((rc) => {
              // todo
            })
          }
        })
      })
      .then(() => {
        // write objectPropertyCollections
        const fieldsSql = _.keys(objectPropertyCollections[0]).join(`,`)
        const valueSql = objectPropertyCollections
          .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
          .join(`,`)
        const sql = `
        insert into
          ae.object_property_collection (${fieldsSql})
        values
          ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() => resolve())
      .catch((error) => reject(error))
  })
