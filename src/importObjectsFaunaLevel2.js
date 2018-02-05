'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxFauna,
  objectsFaunaLevel1
) => {
  const baumFauna = await asyncCouchdbView('artendb/baumFauna', {
    group_level: 2,
  })
  const keys = _.map(baumFauna, row => row.key)
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const objectsFaunaLevel2 = _.map(keys, function(key) {
    const klasseName = key[0]
    const klasseObject = objectsFaunaLevel1.find(
      taxObj => taxObj.name === klasseName
    )
    const name = key[1]
    return {
      id: uuidv1(),
      taxonomy_id: taxFauna.id,
      name,
      parent_id: klasseObject.id,
      category: 'Fauna',
    }
  })
  const fieldsSql = _.keys(objectsFaunaLevel2[0]).join(',')
  const valueSql = objectsFaunaLevel2
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

  return objectsFaunaLevel2
}
