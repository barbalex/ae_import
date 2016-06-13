/* eslint camelcase:0 */
'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)
const getCollectionsFromCouch = require('./getCollectionsFromCouch.js')

const buildDatenstandFromString = (dstString) => {
  if (!dstString) return null
  if (!dstString.length) return null
  if (dstString.length === 4) return `${dstString}.01.01`
  if (dstString.length === 7) return `${dstString}.01`
  if (dstString.length === 10) return dstString
  return null
}

module.exports = (couchDb, pgDb, organization_id, users) =>
  new Promise((resolve, reject) => {
    let sqlPropertyCollections
    let sqlRelationCollections
    let propertyCollections
    let relationCollections
    let colsRC

    getCollectionsFromCouch(couchDb)
      .then((colsPC, resultRC) => {
        colsRC = resultRC
        // build property collections
        propertyCollections = colsPC.map((c) => {
          const id = uuid.v4()
          const name = c[1]
          const description = c[2] || null
          const links = c[3] ? `{"${c[3]}"}` : null
          const number_of_records = c[7]
          const combining = c[4] || false
          const last_updated = buildDatenstandFromString(c[5]) || null
          const terms_of_use = c[6] || null
          const imported_by = users.find((user) => user.email === `alex@gabriel-software.ch`).id || null
          return {
            id,
            name,
            description,
            links,
            number_of_records,
            combining,
            organization_id,
            last_updated,
            terms_of_use,
            imported_by
          }
        })
        // write propertyCollections
        const fieldsSql = _.keys(propertyCollections[0]).join(`,`)
        const valueSql = propertyCollections
          .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
          .join(`,`)
        sqlPropertyCollections = `
        insert into
          ae.property_collection (${fieldsSql})
        values
          ${valueSql};`
        return pgDb.none(sqlPropertyCollections)
      })
      .then(() => {
        console.log(`${propertyCollections.length} property collections exported`)
        // build relation collections
        relationCollections = colsRC.map((c) => {
          const id = uuid.v4()
          const name = c[1]
          const description = c[2] || null
          const links = c[3] ? `{"${c[3]}"}` : null
          const number_of_records = c[7]
          const combining = c[4] || false
          const last_updated = buildDatenstandFromString(c[5]) || null
          const terms_of_use = c[6] || null
          const imported_by = users.find((user) => user.email === `alex@gabriel-software.ch`).id || null
          const nature_of_relation = c[7]
          return {
            id,
            name,
            description,
            links,
            number_of_records,
            combining,
            organization_id,
            last_updated,
            terms_of_use,
            imported_by,
            nature_of_relation
          }
        })
        // write relationCollections
        const fieldsSql = _.keys(relationCollections[0]).join(`,`)
        const valueSql = relationCollections
          .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
          .join(`,`)
        sqlRelationCollections = `
        insert into
          ae.property_collection (${fieldsSql})
        values
          ${valueSql};`
        return pgDb.none(sqlRelationCollections)
      })
      .then(() => {
        console.log(`${relationCollections.length} relation collections exported`)
        resolve(propertyCollections, relationCollections)
      })
      .catch((error) => reject(`error importing property collections: ${error}`))
  })
