'use strict'
/* eslint camelcase:0 quotes:0 */

const extractObjectCollectionsFromCouchObjects = require(`./extractObjectCollectionsFromCouchObjects.js`)

module.exports = (pgDb, couchObjects) =>
  new Promise((resolve, reject) => {
    let propertyCollections
    let relationCollections
    let objectPropertyCollections
    let objectRelationCollections
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
      .then(() =>
        pgDb.none(`truncate ae.object_relation_collection cascade`)
      )
      .then(() =>
        extractObjectCollectionsFromCouchObjects(couchObjects, propertyCollections, relationCollections)
      )
      .then(({ objectPropertyCollectionsToPass, objectRelationCollectionsToPass }) => {
        objectPropertyCollections = objectPropertyCollectionsToPass
        objectRelationCollections = objectRelationCollectionsToPass
        // write objectPropertyCollections
        const valueSql = objectPropertyCollections
          .map((val) =>
            `('${val.object_id}','${val.property_collection_id}')`
          )
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
        const valueSql = objectRelationCollections
          .map((val) =>
            `('${val.object_id}','${val.relation_collection_id}')`
          )
          .join(`,`)
        const sql = `
          insert into
            ae.object_relation_collection (object_id,relation_collection_id)
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
