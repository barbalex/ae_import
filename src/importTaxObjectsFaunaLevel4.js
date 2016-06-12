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
  objects
) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumFauna`, {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFaunaLevel4 = _.map(keys, (key) => {
        const taxonomie = taxFauna.id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) =>
          taxObj.name === klasseObjektName
        )
        const ordnungObjektName = key[1]
        const ordnungObject = taxObjectsFaunaLevel2.find((taxObj) =>
          taxObj.name === ordnungObjektName && taxObj.parent === klasseObject.id
        )
        const familieName = key[2]
        const familieObject = taxObjectsFaunaLevel3.find(
          (taxObj) => taxObj.name === familieName && taxObj.parent === ordnungObject.id
        )
        const name = key[3]
        const parent_id = familieObject.id
        const objId = key[4]
        const object = objects.find((obj) => obj._id === objId)
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          id: uuid.v4(),
          taxonomy_id: taxonomie,
          name,
          object_id: objId,
          object_properties: eigenschaften,
          parent_id
        }
      })
      const fieldsSql = _.keys(taxObjectsFaunaLevel4[0]).join(`,`)
      const valueSql = taxObjectsFaunaLevel4
        .map((tax) => `('${_.values(tax).join("','")}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => {
          console.log(`taxObjectsFaunaLevel4 inserted`)
          resolve(taxObjectsFaunaLevel4)
        })
        .catch((err) =>
          reject(`error inserting taxObjectsFaunaLevel4 ${err}`)
        )
    })
  })
