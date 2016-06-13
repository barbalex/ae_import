'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (
  couchDb,
  pgDb,
  taxFauna,
  taxObjectsFaunaLevel1,
  taxObjectsFaunaLevel2,
  taxObjectsFaunaLevel3,
  couchObjects
) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumFauna`, {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFaunaLevel4 = _.map(keys, (key) => {
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) =>
          taxObj.name === klasseObjektName
        )
        const ordnungObjektName = key[1]
        const ordnungObject = taxObjectsFaunaLevel2.find((taxObj) =>
          taxObj.name === ordnungObjektName && taxObj.parent_id === klasseObject.id
        )
        const familieName = key[2]
        const familieObject = taxObjectsFaunaLevel3.find(
          (taxObj) => taxObj.name === familieName && taxObj.parent_id === ordnungObject.id
        )
        const name = key[3]
        const objId = key[4]
        const object = couchObjects.find((obj) => obj._id === objId)
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          id: uuid.v4(),
          taxonomy_id: taxFauna.id,
          name,
          object_id: objId,
          object_properties: JSON.stringify(eigenschaften),
          parent_id: familieObject.id
        }
      })
      const fieldsSql = _.keys(taxObjectsFaunaLevel4[0]).join(`,`)
      const valueSql = taxObjectsFaunaLevel4
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsFaunaLevel4))
        .catch((err) =>
          reject(`error importing taxObjectsFaunaLevel4 ${err}`)
        )
    })
  })
