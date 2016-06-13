'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxMoose) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumMoose`, {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      const taxObjectsMooseLevel1 = names.map((name) => ({
        id: uuid.v4(),
        taxonomy_id: taxMoose.id,
        name
      }))
      const fieldsSql = _.keys(taxObjectsMooseLevel1[0]).join(`,`)
      const valueSql = taxObjectsMooseLevel1
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsMooseLevel1))
        .catch((err) =>
          reject(`error importing taxObjectsMooseLevel1 ${err}`)
        )
    })
  })
