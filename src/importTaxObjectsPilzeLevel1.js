'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = (couchDb, pgDb, taxPilze) =>
  new Promise((resolve, reject) => {
    couchDb.view(
      'artendb/baumMacromycetes',
      {
        group_level: 1,
      },
      (error, result) => {
        if (error) reject(`error querying view baumMacromycetes: ${error}`)
        const names = _.map(result, row => row.key[0])
        const taxObjectsPilzeLevel1 = names.map(name => ({
          id: uuidv1(),
          taxonomy_id: taxPilze.id,
          name,
        }))
        const fieldsSql = _.keys(taxObjectsPilzeLevel1[0]).join(',')
        const valueSql = taxObjectsPilzeLevel1
          .map(
            tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`
          )
          .join(',')
        const sql = `
      insert into
        ae.taxonomy_object (${fieldsSql})
      values
        ${valueSql};`
        pgDb
          .none(sql)
          .then(() => resolve(taxObjectsPilzeLevel1))
          .catch(err => reject(`error importing taxObjectsPilzeLevel1 ${err}`))
      }
    )
  })
