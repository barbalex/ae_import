'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxFlora) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumFlora`, {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFlora: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      const taxObjectsFloraLevel1 = names.map((name) => ({
        id: uuid.v4(),
        taxonomy_id: taxFlora.id,
        name
      }))
      const fieldsSql = _.keys(taxObjectsFloraLevel1[0]).join(`,`)
      const valueSql = taxObjectsFloraLevel1
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsFloraLevel1))
        .catch((err) =>
          reject(`error inserting taxObjectsFloraLevel1 ${err}`)
        )
    })
  })
