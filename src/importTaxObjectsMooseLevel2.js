'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const { promisify } = require('util')

module.exports = async (couchDb, pgDb, taxMoose, taxObjectsMooseLevel1) => {
  const asyncCouchdbView = promisify(couchDb.view).bind(couchDb)
  const result = asyncCouchdbView('artendb/baumMoose', {
    group_level: 2,
  })
  const keys = _.map(result, row => row.key)
  const taxObjectsMooseLevel2 = _.map(keys, key => {
    const taxonomie = taxMoose.id
    const klasseName = key[0]
    const klasseObject = taxObjectsMooseLevel1.find(
      taxObj => taxObj.name === klasseName
    )
    const name = key[1]
    return {
      id: uuidv1(),
      taxonomy_id: taxonomie,
      name,
      parent_id: klasseObject.id,
    }
  })
  const fieldsSql = _.keys(taxObjectsMooseLevel2[0]).join(',')
  const valueSql = taxObjectsMooseLevel2
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy_object (${fieldsSql})
    values ${valueSql};
  `)

  return taxObjectsMooseLevel2
}
