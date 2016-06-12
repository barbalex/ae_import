'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)
const nonLrTaxonomies = require(`./nonLrTaxonomies.js`)

module.exports = (pgDb, organizationId) =>
  new Promise((resolve, reject) => {
    nonLrTaxonomies.forEach((tax) => {
      tax.id = uuid.v4()
      tax.organization_id = organizationId
    })
    const fieldsSql = _.keys(nonLrTaxonomies[0]).join(`,`)
    const valueSql = nonLrTaxonomies
      .map((tax) => `('${_.values(tax).join("','")}')`)  /* eslint quotes:0 */
      .join(`,`)
    const sql = `
    insert into
      ae.taxonomy (${fieldsSql})
    values
      ${valueSql};`
    pgDb.none(`truncate ae.taxonomy cascade`)
      .then(() => pgDb.none(sql))
      .then(() => {
        console.log(`${nonLrTaxonomies.length} nonLrTaxonomies inserted`)
        resolve(nonLrTaxonomies)
      })
      .catch((error) =>
        reject(`error inserting nonLrTaxonomies ${error}`)
      )
  })
