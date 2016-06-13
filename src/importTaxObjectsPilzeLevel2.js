'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxPilze, taxObjectsPilzeLevel1, couchObjects) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumMacromycetes`, {
      group_level: 3
    }, (error, result) => {
      if (error) reject(`error querying view baumMacromycetes: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsPilzeLevel2 = _.map(keys, (key) => {
        const gattungName = key[0]
        const gattungObject = taxObjectsPilzeLevel1.find((taxObj) =>
          taxObj.name === gattungName
        )
        const name = key[1]
        const objId = key[2]
        const object = couchObjects.find((obj) =>
          obj._id === objId
        )
        if (!object) console.log(`no object found for objId`, objId)
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          id: uuid.v4(),
          taxonomy_id: taxPilze.id,
          name,
          object_id: objId,
          object_properties: JSON.stringify(eigenschaften),
          parent_id: gattungObject.id
        }
      })
      const fieldsSql = _.keys(taxObjectsPilzeLevel2[0]).join(`,`)
      const valueSql = taxObjectsPilzeLevel2
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsPilzeLevel2))
        .catch((err) =>
          reject(`error inserting taxObjectsPilzeLevel2 ${err}`)
        )
    })
  })
