'use strict'

/* eslint camelcase:0 */

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const isUuid = require('is-uuid')

module.exports = async (asyncCouchdbView, pgDb, taxLr) => {
  // console.log('importTaxObjectsLr: taxLr[0]:', taxLr[0])
  const baumLr = await asyncCouchdbView('artendb/baumLr', {
    startkey: [2],
    endkey: [999, '\u9999', '\u9999', '\u9999', '\u9999', '\u9999'],
    reduce: false,
    include_docs: true,
  })
  const lrObjects = _.map(baumLr.rows, b => {
    const doc = b.doc
    doc.taxId = uuidv1()
    return doc
  })
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
    const originalParentId = _.get(
      o,
      'Taxonomie.Eigenschaften.Parent.GUID',
      '99999999-9999-9999-9999-999999999999'
    )
    const parent = lrObjects.find(l => l._id === originalParentId)
    const parent_id = parent
      ? parent.taxId
      : '99999999-9999-9999-9999-999999999999'
    // if (!isUuid.anyNonNil(parent_id)) parent_id = null
    let object_id = o._id.toLowerCase()
    if (!isUuid.anyNonNil(object_id))
      object_id = '99999999-9999-9999-9999-999999999999'
    const hierarchie = _.get(o, 'Taxonomie.Eigenschaften.Hierarchie')
    let previousTaxonomyId = null
    if (hierarchie && hierarchie[0] && hierarchie[0].GUID) {
      // postgre converts uuids to lower case!
      previousTaxonomyId = hierarchie[0].GUID.toLowerCase()
    }
    const previousTaxonomy = taxLr.find(
      t => t.previous_id === previousTaxonomyId
    )
    const taxonomy_id = previousTaxonomy && previousTaxonomy.id
    const properties = _.clone(_.get(o, 'Taxonomie.Eigenschaften', null))
    if (properties.Taxonomie) delete properties.Taxonomie
    if (properties.Parent) delete properties.Parent
    if (properties.Hierarchie) delete properties.Hierarchie

    return {
      id: o.taxId,
      taxonomy_id,
      parent_id,
      object_id,
      name,
      properties,
    }
  })
  // console.log('importTaxObjectsLr: taxObjectsLr[0]:', taxObjectsLr[0])
  const valueSql = taxObjectsLr
    .map(
      val =>
        `('${val.id}','${val.taxonomy_id}','${val.parent_id}','${val.object_id}','${val.name}')`
    )
    .join(',')
  /*
  await pgDb.none(
    'ALTER TABLE ae.taxonomy_object DROP CONSTRAINT taxonomy_object_parent_id_fkey;'
  )*/
  await pgDb.none(`
    insert into ae.taxonomy_object (id,taxonomy_id,parent_id,object_id,name)
    values ${valueSql};
  `)
  await pgDb.task(t =>
    t.batch(
      taxObjectsLr.map(val => {
        const sql2 = `
          UPDATE ae.taxonomy_object
          SET properties = $1
          WHERE id = $2
        `
        return pgDb.none(sql2, [val.properties, val.id])
      })
    )
  )
  /*
  console.log('importTaxObjectsLr: will add reference to parent_id')
  await pgDb.none(`ALTER TABLE ae.taxonomy_object
    ADD CONSTRAINT taxonomy_object_parent_id_fkey FOREIGN KEY (parent_id)
    REFERENCES ae.taxonomy_object (id) ON DELETE CASCADE ON UPDATE CASCADE;
  `)*/
  // console.log('importTaxObjectsLr: 6')
  console.log(`${taxObjectsLr.length} lr taxonomy objects imported`)

  return taxObjectsLr
}
