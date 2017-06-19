'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = (
  couchDb,
  pgDb,
  taxPilze,
  taxObjectsPilzeLevel1,
  couchObjects
) =>
  new Promise((resolve, reject) => {
    couchDb.view(
      'artendb/baumMacromycetes',
      {
        group_level: 3,
      },
      (error, result) => {
        if (error) reject(`error querying view baumMacromycetes: ${error}`)
        const keys = _.map(result, row => row.key)
        const taxObjectsPilzeLevel2 = _.map(keys, key => {
          const gattungName = key[0]
          const gattungObject = taxObjectsPilzeLevel1.find(
            taxObj => taxObj.name === gattungName
          )
          const name = key[1]
          const objId = key[2]
          const object = couchObjects.find(obj => obj._id === objId)
          if (!object) console.log('no object found for objId', objId)
          const properties = object.Taxonomie.Eigenschaften
          return {
            id: uuidv1(),
            taxonomy_id: taxPilze.id,
            name,
            object_id: objId,
            properties,
            parent_id: gattungObject.id,
          }
        })
        const valueSql = taxObjectsPilzeLevel2
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
              taxObjectsPilzeLevel2.map(val => {
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
          .then(() => resolve(taxObjectsPilzeLevel2))
          .catch(err => reject(`error importing taxObjectsPilzeLevel2 ${err}`))
      }
    )
  })
