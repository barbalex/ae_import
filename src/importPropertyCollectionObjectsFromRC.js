'use strict'

const extractRelationCollectionObjectsFromCouchObjects = require('./extractRelationCollectionObjectsFromCouchObjects')

module.exports = async (pgDb, couchObjects) => {
  const {
    propertyCollectionObjects,
    relations,
  } = await extractRelationCollectionObjectsFromCouchObjects(couchObjects, pgDb)
  // write propertyCollectionObjects
  const valueSqlOPC = propertyCollectionObjects
    .map(
      val => `('${val.id}','${val.object_id}','${val.property_collection_id}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.property_collection_object (id,object_id,property_collection_id)
    values ${valueSqlOPC};
  `)
  await pgDb.tx(t =>
    t.batch(
      propertyCollectionObjects.map(val => {
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
    `${propertyCollectionObjects.length} property collection objects imported from relation collections`
  )

  // write relations
  const valueSql = relations
    .map(
      val =>
        `('${val.id}','${val.property_collection_object_id}','${val.related_object_id}','${val.relation_type}')`
    )
    .join(',')
  await pgDb.none(`insert into ae.relation (id,property_collection_object_id,related_object_id,relation_type)
    values ${valueSql};`)
  await pgDb.tx(t =>
    t.batch(
      relations.map(val => {
        const sql = `
          UPDATE ae.relation
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql, [val.properties, val.id])
      })
    )
  )
  console.log(`${relations.length} relations imported`)
  console.log('PostgreSQL welcomes arteigenschaften.ch!')
}
