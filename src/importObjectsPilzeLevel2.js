'use strict'

const _ = require('lodash')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxPilze,
  taxObjectsPilzeLevel1,
  couchObjects
) => {
  const baumMacromycetes = await asyncCouchdbView('artendb/baumMacromycetes', {
    group_level: 3,
  })
  const keys = _.map(baumMacromycetes, row => row.key)
  const taxObjectsPilzeLevel2 = _.map(keys, key => {
    const gattungName = key[0]
    const gattungObject = taxObjectsPilzeLevel1.find(
      taxObj => taxObj.name === gattungName
    )
    const name = key[1]
    const objId = key[2]
    const object = couchObjects.find(obj => obj._id === objId)
    if (!object) console.log('no object found for objId', objId)
    const properties = object.Taxonomie.Eigenschaften
    return {
      id: objId,
      taxonomy_id: taxPilze.id.toLowerCase(),
      name,
      properties,
      parent_id: gattungObject.id,
      category: 'Pilze',
    }
  })
  const valueSql = taxObjectsPilzeLevel2
    .map(
      val =>
        `('${val.id}','${val.taxonomy_id}','${val.name}','${val.parent_id}','${val.category}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.object (id,taxonomy_id,name,parent_id,category)
    values ${valueSql};
  `)
  await pgDb.tx(t =>
    t.batch(
      taxObjectsPilzeLevel2.map(val => {
        const sql2 = `
          UPDATE ae.object
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql2, [val.properties, val.id])
      })
    )
  )

  return taxObjectsPilzeLevel2
}
