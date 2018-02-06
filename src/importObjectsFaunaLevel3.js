'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxFauna,
  objectsFaunaLevel1,
  objectsFaunaLevel2
) => {
  const baumFauna = await asyncCouchdbView('artendb/baumFauna', {
    group_level: 3,
  })

  const keys = _.map(baumFauna, row => row.key)
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const objectsFaunaLevel3 = _.map(keys, function(key) {
    const klasseObjektName = key[0]
    const klasseObject = objectsFaunaLevel1.find(
      taxObj => taxObj.name === klasseObjektName
    )
    const ordnungName = key[1]
    const ordnungObject = objectsFaunaLevel2.find(
      taxObj =>
        taxObj.name === ordnungName && taxObj.parent_id === klasseObject.id
    )
    const name = key[2]
    return {
      id: uuidv1(),
      taxonomy_id: taxFauna.id,
      name,
      parent_id: ordnungObject.id,
    }
  })
  const fieldsSql = _.keys(objectsFaunaLevel3[0]).join(',')
  const valueSql = objectsFaunaLevel3
    .map(
      tax =>
        `('${_.values(tax)
          .join("','")
          .replace(/'',/g, 'null,')}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.object (${fieldsSql})
    values ${valueSql};
  `)

  return objectsFaunaLevel3
}
