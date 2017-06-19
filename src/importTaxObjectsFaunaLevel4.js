'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

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
    couchDb.view(
      'artendb/baumFauna',
      {
        group_level: 5,
      },
      (error, result) => {
        if (error) reject(`error querying view baumFauna: ${error}`)
        const keys = _.map(result, row => row.key)
        const taxObjectsFaunaLevel4 = _.map(keys, key => {
          const klasseObjektName = key[0]
          const klasseObject = taxObjectsFaunaLevel1.find(
            taxObj => taxObj.name === klasseObjektName
          )
          const ordnungObjektName = key[1]
          const ordnungObject = taxObjectsFaunaLevel2.find(
            taxObj =>
              taxObj.name === ordnungObjektName &&
              taxObj.parent_id === klasseObject.id
          )
          const familieName = key[2]
          const familieObject = taxObjectsFaunaLevel3.find(
            taxObj =>
              taxObj.name === familieName &&
              taxObj.parent_id === ordnungObject.id
          )
          const name = key[3].replace("'", '`')
          const objId = key[4]
          const object = couchObjects.find(obj => obj._id === objId)
          const properties = object.Taxonomie.Eigenschaften
          return {
            id: uuidv1(),
            taxonomy_id: taxFauna.id,
            name,
            object_id: objId,
            properties,
            parent_id: familieObject.id,
          }
        })
        const valueSql = taxObjectsFaunaLevel4
          .map(
            val =>
              `('${val.id}','${val.taxonomy_id}','${val.name}','${val.object_id}','${val.parent_id}')`
          )
          .join(',')
        const sql = `
      insert into
        ae.taxonomy_object (id,taxonomy_id,name,object_id,parent_id)
      values
        ${valueSql};`

        pgDb
          .none(sql)
          .then(() =>
            Promise.all(
              taxObjectsFaunaLevel4.map(val => {
                const sql2 = `
              UPDATE
                ae.taxonomy_object
              SET
                properties = $1
              WHERE
                id = $2
            `
                return pgDb.none(sql2, [val.properties, val.id])
              })
            )
          )
          .then(() => resolve(taxObjectsFaunaLevel4))
          .catch(err => reject(`error importing taxObjectsFaunaLevel4 ${err}`))
      }
    )
  })
