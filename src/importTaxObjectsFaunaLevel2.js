'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxFauna, taxObjectsFaunaLevel1) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumFauna`, {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFaunaLevel2 = _.map(keys, (key) => {
        const klasseName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) =>
          taxObj.name === klasseName
        )
        const name = key[1]
        const parent = klasseObject.id
        return {
          id: uuid.v4(),
          taxonomy_id: taxFauna.id,
          name,
          parent
        }
      })
      const fieldsSql = _.keys(taxObjectsFaunaLevel2[0]).join(`,`)
      const valueSql = taxObjectsFaunaLevel2
        .map((tax) => `('${_.values(tax).join("','")}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => {
          console.log(`taxObjectsFaunaLevel2 inserted`)
          resolve(taxObjectsFaunaLevel2)
        })
        .catch((err) =>
          reject(`error inserting taxObjectsFaunaLevel2 ${err}`)
        )
    })
  })
