'use strict'

/* eslint camelcase:0 */

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const getCollectionsFromCouch = require('./getCollectionsFromCouch')
const pcFromRc = require('./pcFromRc')

const buildDatenstandFromString = dstString => {
  if (!dstString) return null
  if (!dstString.length) return null
  if (dstString.length === 4) return `${dstString}.01.01`
  if (dstString.length === 7) return `${dstString}.01`
  if (dstString.length === 10) {
    // check if form is '2001.01.01' or '01.01.2001'
    const dateArray = dstString.split('.')
    if (dateArray[0].length === 4) return dstString
    return dateArray.reverse().join('.')
  }
  return null
}

module.exports = async (asyncCouchdbView, pgDb, organization_id) => {
  const colsPC = await getCollectionsFromCouch(asyncCouchdbView)

  // build property collections
  const propertyCollections = colsPC.map(c => {
    const id = uuidv1()
    let name = c[1]
    const description = c[2] || null
    /**
     * correct an error in the data
     */
    if (
      name === 'Schutz' &&
      description === 'Informationen zu 54 Lebensräumen'
    ) {
      name = 'FNS Schutz (2009)'
    }
    const links = c[3] ? `{"${c[3].replace(/"/g, '')}"}` : null
    const combining = c[4] || false
    const last_updated = buildDatenstandFromString(c[5]) || null
    const terms_of_use = c[6] || null
    const imported_by = 'a8eeeaa2-696f-11e7-b454-83e34acbe09f'

    return {
      id,
      name,
      description,
      links,
      combining,
      organization_id,
      last_updated,
      terms_of_use,
      imported_by,
    }
  })
  // write propertyCollections
  const fieldsSqlPC = _.keys(propertyCollections[0]).join(',')
  const valueSqlPC = propertyCollections
    .map(
      tax =>
        `('${_.values(tax)
          .join("','")
          .replace(/'',/g, 'null,')}')`
    )
    .join(',')
  const sqlPropertyCollections = `insert into ae.property_collection (${fieldsSqlPC}) values ${valueSqlPC};`
  await pgDb.none(sqlPropertyCollections)
  console.log(`${propertyCollections.length} property collections imported`)

  // build relation collections
  const relationCollections = pcFromRc.filter(pc => pc.createNewPc).map(c => {
    const id = uuidv1()
    const name = c.nameNew
    const description = c.description
    const links = c.link
    const combining = false
    const last_updated = c.last_updated
    const terms_of_use = c.terms_of_use
    const imported_by = 'a8eeeaa2-696f-11e7-b454-83e34acbe09f'

    return {
      id,
      name,
      description,
      links,
      combining,
      organization_id,
      last_updated,
      terms_of_use,
      imported_by,
    }
  })
  // write relationCollections
  const fieldsSqlRC = _.keys(relationCollections[0]).join(',')
  const valueSqlRC = relationCollections
    .map(
      tax =>
        `('${_.values(tax)
          .join("','")
          .replace(/'',/g, 'null,')}')`
    )
    .join(',')
  const sqlRelationCollections = `insert into ae.property_collection (${fieldsSqlRC}) values ${valueSqlRC};`
  await pgDb.none(sqlRelationCollections)
  console.log(
    `${
      relationCollections.length
    } new property collections created from relation collections`
  )
  return { propertyCollections, relationCollections }
}
