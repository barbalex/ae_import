'use strict'

/* eslint camelcase:0, no-console:0 */

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const isUuid = require('is-uuid')

module.exports = (couchDb, pgDb, taxLr, couchObjects) =>
  new Promise((resolve, reject) => {
    const lrObjects = couchObjects.filter(o => o.Gruppe === 'Lebensräume')
    const taxObjectsLr = lrObjects.map(o => {
      const label = _.get(o, 'Taxonomie.Eigenschaften.Label', null)
      const einheit = _.get(o, 'Taxonomie.Eigenschaften.Einheit', null)
      let name
      if (label && einheit) {
        name = `${label}: ${einheit}`
      } else if (label) {
        name = label
      } else if (einheit) {
        name = einheit
      }
      let parent_id = _.get(o, 'Taxonomie.Eigenschaften.Parent.GUID', null)
      if (!isUuid.v4(parent_id)) parent_id = null
      let object_id = o._id
      if (!isUuid.v4(object_id)) object_id = null
      const properties = _.clone(_.get(o, 'Taxonomie.Eigenschaften', null))
      if (properties.Taxonomie) delete properties.Taxonomie
      if (properties.Parent) delete properties.Parent
      if (properties.Hierarchie) delete properties.Hierarchie
      return {
        id: uuidv1(),
        taxonomy_id: taxLr.id,
        parent_id,
        object_id,
        name,
        properties,
      }
    })
    const valueSql = taxObjectsLr
      .map(
        val =>
          `('${val.id}','${val.taxonomy_id}','${val.parent_id}','${val.object_id}','${val.name}')`
      )
      .join(',')
    const sql = `
    insert into
      ae.taxonomy_object (id,taxonomy_id,parent_id,object_id,name)
    values
      ${valueSql};`
    pgDb
      .none(sql)
      .then(() =>
        Promise.all(
          taxObjectsLr.map(val => {
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
      .then(() => {
        console.log(`${taxObjectsLr.length} lr taxonomy objects imported`)
        resolve(taxObjectsLr)
      })
      .catch(err => reject(`error importing taxObjectsLr ${err}`))
  })
