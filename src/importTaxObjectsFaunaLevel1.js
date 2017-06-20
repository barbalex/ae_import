'use strict'

const { promisify } = require('util')
const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (couchDb, pgDb, taxFauna) => {
  const asyncCouchdbView = promisify(couchDb.view)
  const baumFauna = await asyncCouchdbView('artendb/baumFauna', {
    group_level: 1,
  })
  const names = _.map(baumFauna, row => row.key[0])
  const taxObjectsFaunaLevel1 = names.map(name => ({
    id: uuidv1(),
    taxonomy_id: taxFauna.id,
    name,
  }))
  const fieldsSql = _.keys(taxObjectsFaunaLevel1[0]).join(',')
  const valueSql = taxObjectsFaunaLevel1
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none('truncate ae.taxonomy_object cascade')
  await pgDb.none(`
    insert into ae.taxonomy_object (${fieldsSql})
    values ${valueSql};
  `)

  return taxObjectsFaunaLevel1
}
