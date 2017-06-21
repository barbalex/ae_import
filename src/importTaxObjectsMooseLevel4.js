'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxMoose,
  taxObjectsMooseLevel1,
  taxObjectsMooseLevel2,
  taxObjectsMooseLevel3,
  couchObjects
) => {
  const baumMoose = await asyncCouchdbView('artendb/baumMoose', {
    group_level: 5,
  })

  const keys = _.map(baumMoose, row => row.key)
  const taxObjectsMooseLevel4 = _.map(keys, key => {
    const klasseObjektName = key[0]
    const klasseObject = taxObjectsMooseLevel1.find(
      taxObj => taxObj.name === klasseObjektName
    )
    const familieObjektName = key[1]
    const familieObject = taxObjectsMooseLevel2.find(
      taxObj =>
        taxObj.name === familieObjektName &&
        taxObj.parent_id === klasseObject.id
    )
    const gattungName = key[2]
    const gattungObject = taxObjectsMooseLevel3.find(
      taxObj =>
        taxObj.name === gattungName && taxObj.parent_id === familieObject.id
    )
    const name = key[3]
    const objId = key[4]
    const object = couchObjects.find(obj => obj._id === objId)
    const properties = object.Taxonomie.Eigenschaften
    return {
      id: uuidv1(),
      taxonomy_id: taxMoose.id.toLowerCase(),
      name,
      object_id: objId.toLowerCase(),
      properties,
      parent_id: gattungObject.id.toLowerCase(),
    }
  })
  const valueSql = taxObjectsMooseLevel4
    .map(
      val =>
        `('${val.id}','${val.taxonomy_id}','${val.name}','${val.object_id}','${val.parent_id}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy_object (id,taxonomy_id,name,object_id,parent_id)
    values ${valueSql};
  `)
  await pgDb.tx(t =>
    t.batch(
      taxObjectsMooseLevel4.map(val => {
        const sql2 = `
          UPDATE ae.taxonomy_object
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql2, [val.properties, val.id])
      })
    )
  )

  return taxObjectsMooseLevel4
}
