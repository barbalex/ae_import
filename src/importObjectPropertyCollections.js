'use strict'
/* eslint camelcase:0 */

const _ = require(`lodash`)
const removeBadCharactersFromJsonB = require(`./removeBadCharactersFromJsonB.js`)

/**
 * TODO: correct property name part "Mitelland" to "Mittelland"
 */
/**
 * correct for:
 * if (name === `Schutz` && description === `Informationen zu 54 Lebensräumen`) {
     name = `FNS Schutz (2009)`
   }
 */

module.exports = (pgDb, couchObjects) =>
  new Promise((resolve, reject) => {
    let propertyCollections
    let relationCollections
    const objectPropertyCollections = []
    const objectRelationCollections = []
    const relations = []
    const relationPartners = []

    pgDb.any(`SELECT * FROM ae.property_collection`)
      .then((resultPC) => {
        propertyCollections = resultPC
        return pgDb.any(`Select * from ae.relation_collection`)
      })
      .then((resultRC) => {
        relationCollections = resultRC
        // console.log('couchObjects[0]', couchObjects[0])
        // console.log('propertyCollections[0]', propertyCollections[0])
        couchObjects.forEach((couchObject) => {
          if (couchObject.Eigenschaftensammlungen) {
            const object_id = couchObject._id
            couchObject.Eigenschaftensammlungen.forEach((couchPC) => {
              // add object_property_collection
              let pcNameToSearchFor = couchPC.Name
              if (couchPC.Name === `Schutz` && couchPC.Beschreibung === `Informationen zu 54 Lebensräumen`) {
                pcNameToSearchFor = `FNS Schutz (2009)`
              }
              const correspondingPC = propertyCollections.find((pc) => pc.name === pcNameToSearchFor)
              if (object_id && correspondingPC && correspondingPC.id) {
                const property_collection_id = correspondingPC.id
                let properties = null
                if (
                  couchPC.Eigenschaften &&
                  Object.keys(couchPC.Eigenschaften) &&
                  Object.keys(couchPC.Eigenschaften).length > 0
                ) {
                  properties = couchPC.Eigenschaften
                  Object.keys(properties).forEach((key) => {
                    properties[key] = removeBadCharactersFromJsonB(properties[key])
                  })
                  properties = properties
                }
                objectPropertyCollections.push({
                  object_id,
                  property_collection_id,
                  properties
                })
              } else {
                console.log(`Pc ${couchPC.Name} not added:`, { object_id, correspondingPC })
              }
            })
          }
          if (couchObject.Beziehungssammlungen) {
            const object_id = couchObject._id
            couchObject.Beziehungssammlungen.forEach((couchRC) => {
              // add object_relation_collection
              const correspondingRC = relationCollections.find((rc) => rc.name === couchRC.Name)
              if (object_id && correspondingRC && correspondingRC.id) {
                const relation_collection_id = correspondingRC.id
                objectRelationCollections.push({ object_id, relation_collection_id })
              } else {
                console.log(`Pc ${couchRC.Name} not added:`, { correspondingRC, couchObject })
              }
            })
          }
        })
      })
      .then(() => {
        // write objectPropertyCollections
        const valueSql = objectPropertyCollections
          .map((val) => `('${val.object_id}','${val.property_collection_id}','${JSON.stringify(val.properties)}')`)  /* eslint quotes:0 */
          .join(`,`)
        const sql = `
        insert into
          ae.object_property_collection (object_id,property_collection_id,properties)
        values
          ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() => {
        // write objectRelationCollections
        console.log('objectRelationCollections[0]', objectRelationCollections[0])
        const fieldsSql = _.keys(objectRelationCollections[0]).join(`,`)
        const valueSql = objectRelationCollections
          .map((val) => `('${_.values(val).join("','").replace(/'',/g, 'null,')}')`)
          .join(`,`)
        const sql = `
        insert into
          ae.object_relation_collection (${fieldsSql})
        values
          ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() => resolve())
      .catch((error) => reject(error))
  })
