'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const { promisify } = require('util')

module.exports = async (couchDb, pgDb, taxFlora, taxObjectsFloraLevel1) => {
  const asyncCouchdbView = promisify(couchDb.view).bind(couchDb)
  const baumFlora = asyncCouchdbView('artendb/baumFlora', {
    group_level: 2,
  })
  const keys = _.map(baumFlora, row => row.key)
  const taxObjectsFloraLevel2 = _.map(keys, key => {
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
    }
  })
  const fieldsSql = _.keys(taxObjectsFloraLevel2[0]).join(',')
  const valueSql = taxObjectsFloraLevel2
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy_object (${fieldsSql})
    values ${valueSql};
  `)

  return taxObjectsFloraLevel2
}
