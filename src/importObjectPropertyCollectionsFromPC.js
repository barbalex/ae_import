'use strict'

const extractObjectPropertyCollectionsFromCouchObjects = require('./extractObjectPropertyCollectionsFromCouchObjects')

module.exports = async (pgDb, couchObjects) => {
  const objectPropertyCollections = extractObjectPropertyCollectionsFromCouchObjects(
    couchObjects,
    pgDb
  )
  // write objectPropertyCollections
  const valueSqlOPC = objectPropertyCollections
    .map(val => `('${val.object_id}','${val.property_collection_id}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.property_collection_object (object_id,property_collection_id)
    values ${valueSqlOPC};
  `)
  await pgDb.tx(t =>
    t.batch(
      objectPropertyCollections.map(val => {
        const sql = `
          UPDATE ae.property_collection_object
          SET properties = $1
          WHERE object_id = $2
          AND property_collection_id = $3
        `
        return pgDb.none(sql, [
          val.properties,
          val.object_id,
          val.property_collection_id,
        ])
      })
    )
  )
  console.log(
    `${objectPropertyCollections.length} property collections imported from property collections`
  )
}
