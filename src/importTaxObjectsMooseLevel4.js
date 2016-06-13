'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (
  couchDb,
  pgDb,
  taxMoose,
  taxObjectsMooseLevel1,
  taxObjectsMooseLevel2,
  taxObjectsMooseLevel3,
  couchObjects
) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumMoose`, {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsMooseLevel4 = _.map(keys, (key) => {
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find((taxObj) =>
          taxObj.name === klasseObjektName
        )
        const familieObjektName = key[1]
        const familieObject = taxObjectsMooseLevel2.find((taxObj) =>
          taxObj.name === familieObjektName && taxObj.parent_id === klasseObject.id
        )
        const gattungName = key[2]
        const gattungObject = taxObjectsMooseLevel3.find((taxObj) =>
          taxObj.name === gattungName && taxObj.parent_id === familieObject.id
        )
        const name = key[3]
        const objId = key[4]
        const object = couchObjects.find((obj) =>
          obj._id === objId
        )
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          id: uuid.v4(),
          taxonomy_id: taxMoose.id,
          name,
          object_id: objId,
          object_properties: JSON.stringify(eigenschaften),
          parent_id: gattungObject.id
        }
      })
      const fieldsSql = _.keys(taxObjectsMooseLevel4[0]).join(`,`)
      const valueSql = taxObjectsMooseLevel4
        .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.tax_object (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => resolve(taxObjectsMooseLevel4))
        .catch((err) =>
          reject(`error inserting taxObjectsMooseLevel4 ${err}`)
        )
    })
  })
