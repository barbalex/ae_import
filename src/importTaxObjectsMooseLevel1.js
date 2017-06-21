'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (asyncCouchdbView, pgDb, taxMoose) => {
  const baumMoose = await asyncCouchdbView('artendb/baumMoose', {
    group_level: 1,
  })
  const names = _.map(baumMoose, row => row.key[0])
  const taxObjectsMooseLevel1 = names.map(name => ({
    id: uuidv1(),
    taxonomy_id: taxMoose.id,
    name,
  }))
  const fieldsSql = _.keys(taxObjectsMooseLevel1[0]).join(',')
  const valueSql = taxObjectsMooseLevel1
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy_object (${fieldsSql})
    values ${valueSql};
  `)

  return taxObjectsMooseLevel1
}
