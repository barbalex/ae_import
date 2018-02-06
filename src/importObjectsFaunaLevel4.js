'use strict'

const _ = require('lodash')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxFauna,
  objectsFaunaLevel1,
  objectsFaunaLevel2,
  objectsFaunaLevel3,
  couchObjects
) => {
  const baumFauna = await asyncCouchdbView('artendb/baumFauna', {
    group_level: 5,
  })

  const keys = _.map(baumFauna, row => row.key)
  const objectsFaunaLevel4 = _.map(keys, key => {
    const klasseObjektName = key[0]
    const klasseObject = objectsFaunaLevel1.find(
      taxObj => taxObj.name === klasseObjektName
    )
    const ordnungObjektName = key[1]
    const ordnungObject = objectsFaunaLevel2.find(
      taxObj =>
        taxObj.name === ordnungObjektName &&
        taxObj.parent_id === klasseObject.id
    )
    const familieName = key[2]
    const familieObject = objectsFaunaLevel3.find(
      taxObj =>
        taxObj.name === familieName && taxObj.parent_id === ordnungObject.id
    )
    const name = key[3].replace("'", '`')
    const objId = key[4]
    const object = couchObjects.find(obj => obj._id === objId)
    const properties = object.Taxonomie.Eigenschaften
    return {
      id: objId.toLowerCase(),
      taxonomy_id: taxFauna.id,
      name,
      properties,
      parent_id: familieObject.id,
      id_old: objId,
    }
  })
  const valueSql = objectsFaunaLevel4
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
      objectsFaunaLevel4.map(val => {
        const sql = `
          UPDATE ae.object
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql, [val.properties, val.id])
      })
    )
  )

  return objectsFaunaLevel4
}
