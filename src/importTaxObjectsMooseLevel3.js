'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxMoose, taxObjectsMooseLevel1, taxObjectsMooseLevel2) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumMoose`, {
      group_level: 3
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsMooseLevel3 = _.map(keys, (key) => {
        const taxonomie = taxMoose.id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find((taxObj) =>
          taxObj.name === klasseObjektName
        )
        const familieName = key[1]
        const familieObject = taxObjectsMooseLevel2.find((taxObj) =>
          taxObj.name === familieName && taxObj.parent_id === klasseObject.id
        )
        const name = key[2]
        return {
          id: uuid.v4(),
          taxonomy_id: taxonomie,
          name,
          parent_id: familieObject.id
        }
      })
      const fieldsSql = _.keys(taxObjectsMooseLevel3[0]).join(`,`)
      const valueSql = taxObjectsMooseLevel3
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.taxonomy_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsMooseLevel3))
        .catch((err) =>
          reject(`error importing taxObjectsMooseLevel3 ${err}`)
        )
    })
  })
