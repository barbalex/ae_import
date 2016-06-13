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
    let collections
    let sqlPropertyCollections
    let sqlRelationCollections
    let propertyCollections
    let relationCollections
    getCollectionsFromCouch(couchDb)
      .then((result) => {
        collections = result

        propertyCollections = Object.keys(collections.pC).map((cName) => {
          const props = collections.pC[cName].props
          const id = uuid.v4()
          const name = cName
          const description = props.Beschreibung || null
          const links = props.Link ? `{"${props.Link}"}` : null
          const number_of_records = collections.pC[cName].rows
          const combining = props.zusammenfassend || false
          const last_updated = buildDatenstandFromString(props.Datenstand) || null
          const terms_of_use = props.Nutzungsbedingungen || null
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
        resolve(propertyCollections, relationCollections)
      })
      .catch((error) => reject(`error importing property collections: ${error}`))
  })
