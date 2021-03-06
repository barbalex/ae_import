'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (asyncCouchdbView, pgDb, taxFauna) => {
  const baumFauna = await asyncCouchdbView('artendb/baumFauna', {
    group_level: 1,
  })
  const names = _.map(baumFauna, row => row.key[0])
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const objectsFaunaLevel1 = names.map(function(name) {
    return {
      id: uuidv1(),
      taxonomy_id: taxFauna.id,
      name,
    }
  })
  const fieldsSql = _.keys(objectsFaunaLevel1[0]).join(',')
  const valueSql = objectsFaunaLevel1
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

  return objectsFaunaLevel1
}
