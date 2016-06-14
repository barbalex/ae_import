'use strict'
/* eslint camelcase:0 quotes:0 */

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
        return pgDb.none(`truncate ae.object_property_collection cascade`)
      })
      .then(() => pgDb.none(`truncate ae.object_relation_collection cascade`))
      .then(() => {
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
          .map((val) => `('${val.object_id}','${val.property_collection_id}')`)
          .join(`,`)
        const sql = `
        insert into
          ae.object_property_collection (object_id,property_collection_id)
        values
          ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() =>
        Promise.all(objectPropertyCollections.map((val) => {
          const sql = `
            UPDATE
              ae.object_property_collection
            SET
              properties = $1
            WHERE
              object_id = $2
          `
          return pgDb.none(sql, [val.properties, val.object_id])
        }))
      )
      .then(() => {
        console.log(`${objectPropertyCollections.length} object property collections imported`)
        // write objectRelationCollections
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
      .then(() => {
        console.log(`${objectRelationCollections.length} object relation collections imported`)
        resolve()
      })
      .catch((error) => reject(error))
  })
