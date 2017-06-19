'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = (
  couchDb,
  pgDb,
  taxFauna,
  taxObjectsFaunaLevel1,
  taxObjectsFaunaLevel2
) =>
  new Promise((resolve, reject) => {
    couchDb.view(
      'artendb/baumFauna',
      {
        group_level: 3,
      },
      (error, result) => {
        if (error) reject(`error querying view baumFauna: ${error}`)
        const keys = _.map(result, row => row.key)
        const taxObjectsFaunaLevel3 = _.map(keys, key => {
          const klasseObjektName = key[0]
          const klasseObject = taxObjectsFaunaLevel1.find(
            taxObj => taxObj.name === klasseObjektName
          )
          const ordnungName = key[1]
          const ordnungObject = taxObjectsFaunaLevel2.find(
            taxObj =>
              taxObj.name === ordnungName &&
              taxObj.parent_id === klasseObject.id
          )
          const name = key[2]
          return {
            id: uuidv1(),
            taxonomy_id: taxFauna.id,
            name,
            parent_id: ordnungObject.id,
          }
        })
        const fieldsSql = _.keys(taxObjectsFaunaLevel3[0]).join(',')
        const valueSql = taxObjectsFaunaLevel3
          .map(
            tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`
          ) /* eslint quotes:0 */
          .join(',')
        const sql = `
      insert into
        ae.taxonomy_object (${fieldsSql})
      values
        ${valueSql};`
        pgDb
          .none(sql)
          .then(() => resolve(taxObjectsFaunaLevel3))
          .catch(err => reject(`error importing taxObjectsFaunaLevel3 ${err}`))
      }
    )
  })
