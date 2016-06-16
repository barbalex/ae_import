'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxFlora, taxObjectsFloraLevel1) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumFlora`, {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumFlora: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFloraLevel2 = _.map(keys, (key) => {
        const familieName = key[0]
        const familieObject = taxObjectsFloraLevel1.find((taxObj) =>
          taxObj.name === familieName
        )
        const name = key[1]
        return {
          id: uuid.v4(),
          taxonomy_id: taxFlora.id,
          name,
          parent_id: familieObject.id
        }
      })
      const fieldsSql = _.keys(taxObjectsFloraLevel2[0]).join(`,`)
      const valueSql = taxObjectsFloraLevel2
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.taxonomy_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsFloraLevel2))
        .catch((err) =>
          reject(`error importing taxObjectsFloraLevel2 ${err}`)
        )
    })
  })
