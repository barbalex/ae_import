/* eslint camelcase:0 */
'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)
const getPropertyCollectionsFromCouch = require('./getPropertyCollectionsFromCouch.js')
const getFieldsOfPropertyCollectionsFromCouch = require('./getFieldsOfPropertyCollectionsFromCouch.js')

const buildDatenstandFromString = (dstString) => {
  if (dstString.length === 4) return `${dstString}.01.01`
  if (dstString.length === 7) return `${dstString}.01`
  if (dstString.length === 10) return dstString
  return null
}

module.exports = (couchDb, pgDb, organization_id, users) =>
  new Promise((resolve, reject) => {
    let rawPropertyCollectionsResult
    let rawPropertyCollections
    let rawRelationCollections
    let sqlPropertyCollections
    let sqlRelationCollections
    let propertyCollections
    let relationCollections
    getPropertyCollectionsFromCouch(couchDb)
      .then((result) => {
        rawPropertyCollectionsResult = result
        const rawCollectionsArrays = _.map(rawPropertyCollectionsResult, (row) => row.key)
        rawPropertyCollections = rawCollectionsArrays.filter((el) => el[0] === 'Datensammlung')
        rawRelationCollections = rawCollectionsArrays.filter((el) => el[0] === 'Beziehungssammlung')
        const cNames = _.uniq(rawCollectionsArrays.map((rC) => rC[1]))
        console.log(`importCollections.js, cNames`, cNames)
        return getFieldsOfPropertyCollectionsFromCouch(couchDb, cNames)
      })
      .then((fieldsByCName) => {
        propertyCollections = rawPropertyCollections.map((pc) => {
          const id = uuid.v4()
          const name = pc[1]
          const felder = pc[5]
          const description = felder.Beschreibung
          const links = `{"${felder.Link}"}`
          const number_of_records = rawPropertyCollectionsResult.find((row) => row.key === pc).value
          const property_fields = `{"${fieldsByCName[name].join('","')}"}`
          const combining = pc[2] || false
          const last_updated = buildDatenstandFromString(felder.Datenstand) || null
          const terms_of_use = felder.Nutzungsbedingungen || null
          const imported_by = users.find((user) => user.email === `alex@gabriel-software.ch`)
          return {
            id,
            name,
            description,
            links,
            number_of_records,
            property_fields,
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
      .then(() => resolve(propertyCollections, relationCollections))
      .catch((error) => reject(`error importing property collections: ${error}`))
  })
