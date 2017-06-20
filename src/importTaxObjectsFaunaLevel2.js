'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const { promisify } = require('util')

module.exports = async (couchDb, pgDb, taxFauna, taxObjectsFaunaLevel1) => {
  const asyncCouchdbView = promisify(couchDb.view).bind(couchDb)
  const result = asyncCouchdbView('artendb/baumFauna', {
    group_level: 2,
  })
  const keys = _.map(result, row => row.key)
  const taxObjectsFaunaLevel2 = _.map(keys, key => {
    const klasseName = key[0]
    const klasseObject = taxObjectsFaunaLevel1.find(
      taxObj => taxObj.name === klasseName
    )
    const name = key[1]
    return {
      id: uuidv1(),
      taxonomy_id: taxFauna.id,
      name,
      parent_id: klasseObject.id,
    }
  })
  const fieldsSql = _.keys(taxObjectsFaunaLevel2[0]).join(',')
  const valueSql = taxObjectsFaunaLevel2
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy_object (${fieldsSql})
    values ${valueSql};
  `)

  return taxObjectsFaunaLevel2
}
