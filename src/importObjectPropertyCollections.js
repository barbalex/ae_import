'use strict'

const extractObjectCollectionsFromCouchObjects = require('./extractObjectCollectionsFromCouchObjects')

module.exports = async (pgDb, couchObjects) => {
  const propertyCollections = await pgDb.any(
    'SELECT * FROM ae.property_collection'
  )
  await pgDb.none('truncate ae.property_collection_object')
  await pgDb.none('truncate ae.relation cascade')
  const {
    objectPropertyCollections,
    relations,
  } = extractObjectCollectionsFromCouchObjects(
    couchObjects,
    propertyCollections
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
        const sql2 = `
          UPDATE ae.property_collection_object
          SET properties = $1
          WHERE object_id = $2
          AND property_collection_id = $3
        `
        return pgDb.none(sql2, [
          val.properties,
          val.object_id,
          val.property_collection_id,
        ])
      })
    )
  )
  console.log(
    `${objectPropertyCollections.length} object property collections imported`
  )

  // TODO: refactor
  // write relations
  const valueSql = relations
    .map(
      val => `('${val.id}','${val.object_id}','${val.relation_collection_id}')`
    )
    .join(',')
  await pgDb.none(`insert into ae.relation (id,object_id,relation_collection_id)
    values ${valueSql};`)
  await pgDb.tx(t =>
    t.batch(
      relations.map(val => {
        const sql2 = `
          UPDATE ae.relation
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql2, [val.properties, val.id])
      })
    )
  )
  console.log(`${relations.length} relations imported`)
  console.log('PostgreSQL welcomes arteigenschaften.ch!')
}
