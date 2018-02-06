'use strict'

const _ = require('lodash')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxFlora,
  taxObjectsFloraLevel1,
  taxObjectsFloraLevel2,
  couchObjects
) => {
  const baumFlora = await asyncCouchdbView('artendb/baumFlora', {
    group_level: 4,
  })

  const keys = _.map(baumFlora, row => row.key)
  const taxObjectsFloraLevel3 = _.map(keys, key => {
    const familieObjektName = key[0]
    const familieObject = taxObjectsFloraLevel1.find(
      taxObj => taxObj.name === familieObjektName
    )
    const gattungName = key[1]
    const gattungObject = taxObjectsFloraLevel2.find(
      taxObj =>
        taxObj.name === gattungName && taxObj.parent_id === familieObject.id
    )
    const name = key[2]
    const objId = key[3]
    const object = couchObjects.find(obj => obj._id === objId)
    const properties = object.Taxonomie.Eigenschaften
    return {
      id: objId.toLowerCase(),
      taxonomy_id: taxFlora.id,
      name,
      properties,
      parent_id: gattungObject.id,
      id_old: objId,
    }
  })
  const valueSql = taxObjectsFloraLevel3
    .map(
      val =>
        `('${val.id}','${val.taxonomy_id}','${val.name}','${val.parent_id}','${
          val.id_old
        }')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.object (id,taxonomy_id,name,parent_id,id_old)
    values ${valueSql};
  `)
  await pgDb.tx(t =>
    t.batch(
      taxObjectsFloraLevel3.map(val => {
        const sql = `
          UPDATE ae.object
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql, [val.properties, val.id])
      })
    )
  )
  return taxObjectsFloraLevel3
}
