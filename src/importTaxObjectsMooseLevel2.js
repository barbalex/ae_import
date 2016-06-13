'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxMoose, taxObjectsMooseLevel1) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumMoose`, {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsMooseLevel2 = _.map(keys, (key) => {
        const taxonomie = taxMoose.id
        const klasseName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find((taxObj) =>
          taxObj.name === klasseName
        )
        const name = key[1]
        return {
          id: uuid.v4(),
          taxonomy_id: taxonomie,
          name,
          parent_id: klasseObject.id
        }
      })
      const fieldsSql = _.keys(taxObjectsMooseLevel2[0]).join(`,`)
      const valueSql = taxObjectsMooseLevel2
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsMooseLevel2))
        .catch((err) =>
          reject(`error inserting taxObjectsMooseLevel2 ${err}`)
        )
    })
  })
