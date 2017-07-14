'use strict'

const extractRelationsFromCouchObjects = require('./extractRelationsFromCouchObjects')

module.exports = async (pgDb, couchObjects) => {
  const relations = await extractRelationsFromCouchObjects(couchObjects, pgDb)
  // write relations
  const valueSql = relations
    .map(
      val =>
        // eslint-disable-next-line max-len
        `('${val.id}','${val.property_collection_id}','${val.object_id}','${val.object_id_relation}','${val.relation_type}')`
    )
    .join(',')
  await pgDb.none(`insert into ae.relation (id,property_collection_id,object_id,object_id_relation,relation_type)
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
}
