'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const nonLrTaxonomies = require('./nonLrTaxonomies.js')

module.exports = async (pgDb, organizationId) => {
  nonLrTaxonomies.forEach(tax => {
    tax.id = uuidv1()
    tax.organization_id = organizationId
  })
  const fieldsSql = _.keys(nonLrTaxonomies[0]).join(',')
  const valueSql = nonLrTaxonomies
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none('truncate ae.taxonomy cascade')
  await pgDb.none(`
    insert into ae.taxonomy (${fieldsSql})
    values ${valueSql};
  `)
  console.log(`${nonLrTaxonomies.length} nonLrTaxonomies imported`)

  return nonLrTaxonomies
}
