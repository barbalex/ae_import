'use strict'

const extractPropertyCollectionObjectsFromCouchObjects = require('./extractPropertyCollectionObjectsFromCouchObjects')

module.exports = async (pgDb, couchObjects) => {
  const propertyCollectionObjects = await extractPropertyCollectionObjectsFromCouchObjects(
    couchObjects,
    pgDb
  )
  // write propertyCollectionObjects
  const valueSqlOPC = propertyCollectionObjects
    .map(
      val =>
        `('${val.object_id}','${val.property_collection_id}','${
          val.property_collection_of_origin_name
        }')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.property_collection_object (object_id,property_collection_id,property_collection_of_origin_name)
    values ${valueSqlOPC};
  `)
  await pgDb.tx(t =>
    t.batch(
      propertyCollectionObjects.map(val => {
        const sql = `
          UPDATE ae.property_collection_object
          SET properties = $1
          WHERE object_id = $2
          AND property_collection_id = $3;
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
    `${
      propertyCollectionObjects.length
    } property collection objects imported from property collections`
  )
}
