'use strict'

/* eslint camelcase:0 */

const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const getCollectionsFromCouch = require('./getCollectionsFromCouch.js')

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

module.exports = async (couchDb, pgDb, organization_id, users) => {
  await pgDb.none('truncate ae.property_collection cascade')
  await pgDb.none('truncate ae.relation_collection cascade')
  const { colsPC, colsRC } = await getCollectionsFromCouch(couchDb)
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
    const imported_by =
      users.find(user => user.email === 'alex@gabriel-software.ch').id || null

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
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  const sqlPropertyCollections = `insert into ae.property_collection (${fieldsSqlPC}) values ${valueSqlPC};`
  await pgDb.none(sqlPropertyCollections)
  console.log(`${propertyCollections.length} property collections imported`)
  // build relation collections
  const relationCollections = colsRC.map(c => {
    const id = uuidv1()
    const name = c[1]
    const description = c[2] || null
    const links = c[3] ? `{"${c[3].replace(/"/g, '')}"}` : null
    const combining = c[4] || false
    const last_updated = buildDatenstandFromString(c[5]) || null
    const terms_of_use = c[6] || null
    const imported_by =
      users.find(user => user.email === 'alex@gabriel-software.ch').id || null
    const nature_of_relation = c[7]

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
      nature_of_relation,
    }
  })
  // write relationCollections
  const fieldsSqlRC = _.keys(relationCollections[0]).join(',')
  const valueSqlRC = relationCollections
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  const sqlRelationCollections = `insert into ae.relation_collection (${fieldsSqlRC}) values ${valueSqlRC};`
  await pgDb.none(sqlRelationCollections)
  console.log(`${relationCollections.length} relation collections imported`)
  return { propertyCollections, relationCollections }
}
