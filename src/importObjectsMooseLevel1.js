'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (asyncCouchdbView, pgDb, taxMoose) => {
  const baumMoose = await asyncCouchdbView('artendb/baumMoose', {
    group_level: 1,
  })
  const names = _.map(baumMoose, row => row.key[0])
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const taxObjectsMooseLevel1 = names.map(function(name) {
    return {
      id: uuidv1(),
      taxonomy_id: taxMoose.id,
      name,
      category: 'Moose',
    }
  })
  const fieldsSql = _.keys(taxObjectsMooseLevel1[0]).join(',')
  const valueSql = taxObjectsMooseLevel1
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

  return taxObjectsMooseLevel1
}
