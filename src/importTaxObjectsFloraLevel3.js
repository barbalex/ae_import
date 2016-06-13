'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxFlora, taxObjectsFloraLevel1, taxObjectsFloraLevel2, couchObjects) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumFlora`, {
      group_level: 4
    }, (error, result) => {
      if (error) reject(`error querying view baumFlora: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFloraLevel3 = _.map(keys, (key) => {
        const familieObjektName = key[0]
        const familieObject = taxObjectsFloraLevel1.find((taxObj) =>
          taxObj.name === familieObjektName
        )
        const gattungName = key[1]
        const gattungObject = taxObjectsFloraLevel2.find((taxObj) =>
          taxObj.name === gattungName && taxObj.parent_id === familieObject.id
        )
        const name = key[2]
        const objId = key[3]
        const object = couchObjects.find((obj) => obj._id === objId)
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          id: uuid.v4(),
          taxonomy_id: taxFlora.id,
          name,
          object_id: objId,
          object_properties: JSON.stringify(eigenschaften),
          parent_id: gattungObject.id
        }
      })
      const fieldsSql = _.keys(taxObjectsFloraLevel3[0]).join(`,`)
      const valueSql = taxObjectsFloraLevel3
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsFloraLevel3))
        .catch((err) =>
          reject(`error importing taxObjectsFloraLevel3 ${err}`)
        )
    })
  })
