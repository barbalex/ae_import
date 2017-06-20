'use strict'

const extractObjectCollectionsFromCouchObjects = require('./extractObjectCollectionsFromCouchObjects.js')
const wait5s = require('./wait5s.js')

module.exports = async (pgDb, couchObjects) => {
  const propertyCollections = await pgDb.any(
    'SELECT * FROM ae.property_collection'
  )
  const relationCollections = await pgDb.any(
    'Select * from ae.relation_collection'
  )
  await pgDb.none('truncate ae.property_collection_object')
  await pgDb.none('truncate ae.relation_collection_object cascade')
  await pgDb.none('truncate ae.relation cascade')
  await pgDb.none('truncate ae.relation_partner')
  const {
    objectPropertyCollections,
    objectRelationCollections,
    relations,
    relationPartners,
  } = extractObjectCollectionsFromCouchObjects(
    couchObjects,
    propertyCollections,
    relationCollections
  )
  // write objectPropertyCollections
  const valueSqlOPC = objectPropertyCollections
    .map(val => `('${val.object_id}','${val.property_collection_id}')`)
    .join(',')
  const sql = `insert into ae.property_collection_object (object_id,property_collection_id)
  values ${valueSqlOPC};`
  await pgDb.none(sql)
  await wait5s()
  await Promise.all(
    objectPropertyCollections.map(val => {
      const sql2 = `
        UPDATE ae.property_collection_object
        SET properties = $1
        WHERE object_id = $2
      `
      return pgDb.none(sql2, [val.properties, val.object_id])
    })
  )
  console.log(
    `${objectPropertyCollections.length} object property collections imported`
  )
  // write objectRelationCollections
  const valueSqlORC = objectRelationCollections
    .map(val => `('${val.object_id}','${val.relation_collection_id}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.relation_collection_object (object_id,relation_collection_id)
    values ${valueSqlORC};`)
  console.log(
    `${objectRelationCollections.length} object relation collections imported`
  )
  // write relations
  const valueSql = relations
    .map(
      val => `('${val.id}','${val.object_id}','${val.relation_collection_id}')`
    )
    .join(',')
  await pgDb.none(`insert into ae.relation (id,object_id,relation_collection_id)
    values ${valueSql};`)
  await wait5s()
  await Promise.all(
    relations.map(val => {
      const sql2 = `
        UPDATE ae.relation
        SET properties = $1
        WHERE id = $2
      `
      return pgDb.none(sql2, [val.properties, val.id])
    })
  )
  console.log(`${relations.length} relations imported`)
  // write relationPartners
  const valueSqlRP = relationPartners
    .map(val => `('${val.object_id}','${val.relation_id}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.relation_partner (object_id,relation_id)
    values ${valueSqlRP};`)
  console.log(`${relationPartners.length} relationPartners imported`)
  console.log('PostgreSQL welcomes arteigenschaften.ch!')
}
