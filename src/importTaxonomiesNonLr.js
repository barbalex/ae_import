'use strict'

/* eslint-disable max-len */

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const nonLrTaxonomies = require('./nonLrTaxonomies')

module.exports = async pgDb => {
  // eslint-disable-next-line prefer-arrow-callback, func-names
  nonLrTaxonomies.forEach(function(tax) {
    tax.id = uuidv1()
    tax.type = 'Lebensraum'
    tax.organization_id = 'a8e5bc98-696f-11e7-b453-3741aafa0388'
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
