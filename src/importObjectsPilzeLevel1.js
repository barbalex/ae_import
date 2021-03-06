'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (asyncCouchdbView, pgDb, taxPilze) => {
  const baumMacromycetes = await asyncCouchdbView('artendb/baumMacromycetes', {
    group_level: 1,
  })
  const names = _.map(baumMacromycetes, row => row.key[0])
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const taxObjectsPilzeLevel1 = names.map(function(name) {
    return {
      id: uuidv1(),
      taxonomy_id: taxPilze.id,
      name,
    }
  })
  const fieldsSql = _.keys(taxObjectsPilzeLevel1[0]).join(',')
  const valueSql = taxObjectsPilzeLevel1
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

  return taxObjectsPilzeLevel1
}
