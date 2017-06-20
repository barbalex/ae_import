'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = (couchDb, pgDb, taxFauna) =>
  new Promise((resolve, reject) => {
    couchDb.view(
      'artendb/baumFauna',
      {
        group_level: 1,
      },
      async (error, result) => {
        if (error) reject(`error querying view baumFauna: ${error}`)
        const names = _.map(result, row => row.key[0])
        const taxObjectsFaunaLevel1 = names.map(name => ({
          id: uuidv1(),
          taxonomy_id: taxFauna.id,
          name,
        }))
        const fieldsSql = _.keys(taxObjectsFaunaLevel1[0]).join(',')
        const valueSql = taxObjectsFaunaLevel1
          .map(
            tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`
          )
          .join(',')
        await pgDb.none('truncate ae.taxonomy_object cascade')
        await pgDb.none(`
          insert into ae.taxonomy_object (${fieldsSql})
          values ${valueSql};
        `)
        return taxObjectsFaunaLevel1
      }
    )
  })
