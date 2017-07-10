'use strict'

/* eslint camelcase:0 */

const _ = require('lodash')
const isUuid = require('is-uuid')

module.exports = async (asyncCouchdbView, pgDb, taxLr) => {
  const baumLr = await asyncCouchdbView('artendb/baumLr', {
    startkey: [2],
    endkey: [999, '\u9999', '\u9999', '\u9999', '\u9999', '\u9999'],
    reduce: false,
    include_docs: true,
  })
  const lrObjects = _.map(baumLr.rows, b => b.doc)
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
    const parentId = _.get(o, 'Taxonomie.Eigenschaften.Parent.GUID', null)
    const parent = lrObjects.find(l => l._id === parentId)
    const parent_id =
      parent && parent.id && isUuid.anyNonNil(parent.id) ? parent.id : null
    const previousTaxonomyId = _.get(
      o,
      'Taxonomie.Eigenschaften.Hierarchie[0].GUID'
    )
    const taxonomy = taxLr.find(t => t.id === previousTaxonomyId.toLowerCase())
    const taxonomy_id = _.get(taxonomy, 'id', null)
    const properties = _.clone(_.get(o, 'Taxonomie.Eigenschaften', null))
    if (properties.Taxonomie) delete properties.Taxonomie
    if (properties.Parent) delete properties.Parent
    if (properties.Hierarchie) delete properties.Hierarchie

    return {
      id: o._id,
      taxonomy_id,
      parent_id,
      name,
      properties,
    }
  })
  const valueSql = taxObjectsLr
    .map(
      val =>
        `('${val.id}',${val.taxonomy_id
          ? `'${val.taxonomy_id}'`
          : null},${val.parent_id ? `'${val.parent_id}'` : null},'${val.name}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.object (id,taxonomy_id,parent_id,name)
    values ${valueSql};
  `)
  await pgDb.tx(t =>
    t.batch(
      taxObjectsLr.map(val => {
        const sql2 = `
          UPDATE ae.object
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql2, [val.properties, val.id])
      })
    )
  )
  console.log(`${taxObjectsLr.length} lr taxonomy objects imported`)

  return taxObjectsLr
}