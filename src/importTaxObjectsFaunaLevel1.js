'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxFauna) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumFauna`, {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      const taxObjectsFaunaLevel1 = names.map((name) => ({
        id: uuid.v4(),
        taxonomy_id: taxFauna.id,
        name
      }))
      const fieldsSql = _.keys(taxObjectsFaunaLevel1[0]).join(`,`)
      const valueSql = taxObjectsFaunaLevel1
        .map((tax) => `('${_.values(tax).join("','")}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => {
          console.log(`taxObjectsFaunaLevel1 inserted`)
          resolve(taxObjectsFaunaLevel1)
        })
        .catch((err) =>
          reject(`error inserting taxObjectsFaunaLevel1 ${err}`)
        )
    })
  })
