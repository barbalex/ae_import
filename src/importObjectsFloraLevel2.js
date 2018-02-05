'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxFlora,
  taxObjectsFloraLevel1
) => {
  const baumFlora = await asyncCouchdbView('artendb/baumFlora', {
    group_level: 2,
  })
  const keys = _.map(baumFlora, row => row.key)
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const taxObjectsFloraLevel2 = _.map(keys, function(key) {
    const familieName = key[0]
    const familieObject = taxObjectsFloraLevel1.find(
      taxObj => taxObj.name === familieName
    )
    const name = key[1]
    return {
      id: uuidv1(),
      taxonomy_id: taxFlora.id,
      name,
      parent_id: familieObject.id,
      category: 'Flora',
    }
  })
  const fieldsSql = _.keys(taxObjectsFloraLevel2[0]).join(',')
  const valueSql = taxObjectsFloraLevel2
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

  return taxObjectsFloraLevel2
}
