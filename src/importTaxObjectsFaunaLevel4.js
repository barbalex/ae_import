'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const { promisify } = require('util')

module.exports = async (
  couchDb,
  pgDb,
  taxFauna,
  taxObjectsFaunaLevel1,
  taxObjectsFaunaLevel2,
  taxObjectsFaunaLevel3,
  couchObjects
) => {
  const asyncCouchdbView = promisify(couchDb.view).bind(couchDb)
  const result = asyncCouchdbView('artendb/baumFauna', {
    group_level: 5,
  })

  const keys = _.map(result, row => row.key)
  const taxObjectsFaunaLevel4 = _.map(keys, key => {
    const klasseObjektName = key[0]
    const klasseObject = taxObjectsFaunaLevel1.find(
      taxObj => taxObj.name === klasseObjektName
    )
    const ordnungObjektName = key[1]
    const ordnungObject = taxObjectsFaunaLevel2.find(
      taxObj =>
        taxObj.name === ordnungObjektName &&
        taxObj.parent_id === klasseObject.id
    )
    const familieName = key[2]
    const familieObject = taxObjectsFaunaLevel3.find(
      taxObj =>
        taxObj.name === familieName && taxObj.parent_id === ordnungObject.id
    )
    const name = key[3].replace("'", '`')
    const objId = key[4]
    const object = couchObjects.find(obj => obj._id === objId)
    const properties = object.Taxonomie.Eigenschaften
    return {
      id: uuidv1(),
      taxonomy_id: taxFauna.id,
      name,
      object_id: objId,
      properties,
      parent_id: familieObject.id,
    }
  })
  const valueSql = taxObjectsFaunaLevel4
    .map(
      val =>
        `('${val.id}','${val.taxonomy_id}','${val.name}','${val.object_id}','${val.parent_id}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy_object (id,taxonomy_id,name,object_id,parent_id)
    values ${valueSql};
  `)
  await Promise.all(
    taxObjectsFaunaLevel4.map(val => {
      const sql = `
        UPDATE ae.taxonomy_object
        SET properties = $1
        WHERE id = $2
      `
      return pgDb.none(sql, [val.properties, val.id])
    })
  )

  return taxObjectsFaunaLevel4
}
