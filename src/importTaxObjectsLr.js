'use strict'

/* eslint camelcase:0 */

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const isUuid = require('is-uuid')

module.exports = async (asyncCouchdbView, pgDb, taxLr) => {
  console.log('importTaxObjectsLr: taxLr[0]:', taxLr[0])
  const baumLr = await asyncCouchdbView('artendb/baumLr', {
    startkey: [2],
    endkey: [999, '\u9999', '\u9999', '\u9999', '\u9999', '\u9999'],
    reduce: false,
    include_docs: true,
  })
  const lrObjects = _.map(baumLr.rows, 'doc')
  console.log('importTaxObjectsLr: lrObjects[0]:', lrObjects[0])
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
    const hierarchie = _.get(o, 'Taxonomie.Eigenschaften.Hierarchie')
    if (!hierarchie) {
      console.log(
        'importTaxObjectsLr: found no Taxonomie.Eigenschaften.Hierarchie in:',
        o
      )
    }
    let previousTaxonomyId = null
    if (hierarchie && hierarchie[0] && hierarchie[0].GUID) {
      // postgre converts uuids to lower case!
      previousTaxonomyId = hierarchie[0].GUID.toLowerCase()
    } else {
      console.log(
        'importTaxObjectsLr: found no Taxonomie.Eigenschaften.Hierarchie[0].GUID in:',
        o
      )
    }
    const previousTaxonomy = taxLr.find(
      t => t.previous_id === previousTaxonomyId
    )
    if (!previousTaxonomy) {
      console.log('importTaxObjectsLr: found no previousTaxonomy for:', o)
    }
    const taxonomy_id = previousTaxonomy && previousTaxonomy.id
    if (!taxonomy_id) {
      console.log('importTaxObjectsLr: found no taxonomy_id for:', o)
    }
    const properties = _.clone(_.get(o, 'Taxonomie.Eigenschaften', null))
    if (properties.Taxonomie) delete properties.Taxonomie
    if (properties.Parent) delete properties.Parent
    if (properties.Hierarchie) delete properties.Hierarchie

    return {
      id: uuidv1(),
      taxonomy_id,
      parent_id,
      object_id,
      name,
      properties,
    }
  })
  console.log('importTaxObjectsLr: taxObjectsLr[0]:', taxObjectsLr[0])
  const valueSql = taxObjectsLr
    .map(
      val =>
        `('${val.id}','${val.taxonomy_id}','${val.parent_id}','${val.object_id}','${val.name}')`
    )
    .join(',')
  console.log('importTaxObjectsLr: 4')
  await pgDb.none(
    'ALTER TABLE ae.taxonomy_object DROP CONSTRAINT taxonomy_object_parent_id_fkey;'
  )
  await pgDb.none(`
    insert into ae.taxonomy_object (id,taxonomy_id,parent_id,object_id,name)
    values ${valueSql};
  `)
  console.log('importTaxObjectsLr: 5')
  await Promise.all(
    taxObjectsLr.map(val => {
      const sql2 = `
        UPDATE ae.taxonomy_object
        SET properties = $1
        WHERE id = $2
      `
      return pgDb.none(sql2, [val.properties, val.id])
    })
  )
  await pgDb.none(`ALTER TABLE ae.taxonomy_object
    ADD CONSTRAINT taxonomy_object_parent_id_fkey FOREIGN KEY (parent_id) 
    REFERENCES ae.taxonomy_object (id) ON DELETE CASCADE ON UPDATE CASCADE;
  `)
  console.log('importTaxObjectsLr: 6')
  console.log(`${taxObjectsLr.length} lr taxonomy objects imported`)

  return taxObjectsLr
}
