'use strict'

/* eslint-disable max-len */

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const nonLrTaxonomies = require('./nonLrTaxonomies')

module.exports = async (pgDb, organizationId) => {
  nonLrTaxonomies.forEach(tax => {
    tax.id = uuidv1()
    tax.organization_id = organizationId
    tax.imported_by = 'a8eeeaa2-696f-11e7-b454-83e34acbe09f'
    tax.terms_of_use =
      'Importiert mit Einverständnis des Autors. Eine allfällige Weiterverbreitung ist nur mit dessen Zustimmung möglich.'
  })
  const fieldsSql = _.keys(nonLrTaxonomies[0]).join(',')
  const valueSql = nonLrTaxonomies
    .map(
      tax =>
        `('${_.values(tax)
          .join("','")
          .replace(/'',/g, 'null,')}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy (${fieldsSql})
    values ${valueSql};
  `)
  console.log(`${nonLrTaxonomies.length} nonLrTaxonomies imported`)

  return nonLrTaxonomies
}
