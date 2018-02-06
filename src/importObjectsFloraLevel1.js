'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (asyncCouchdbView, pgDb, taxFlora) => {
  const baumFlora = await asyncCouchdbView('artendb/baumFlora', {
    group_level: 1,
  })
  const names = _.map(baumFlora, row => row.key[0])
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const taxObjectsFloraLevel1 = names.map(function(name) {
    return {
      id: uuidv1(),
      taxonomy_id: taxFlora.id,
      name,
    }
  })
  const fieldsSql = _.keys(taxObjectsFloraLevel1[0]).join(',')
  const valueSql = taxObjectsFloraLevel1
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

  return taxObjectsFloraLevel1
}
