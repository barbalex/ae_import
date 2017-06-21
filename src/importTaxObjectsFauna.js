'use strict'

const importTaxObjectsFaunaLevel1 = require('./importTaxObjectsFaunaLevel1.js')
const importTaxObjectsFaunaLevel2 = require('./importTaxObjectsFaunaLevel2.js')
const importTaxObjectsFaunaLevel3 = require('./importTaxObjectsFaunaLevel3.js')
const importTaxObjectsFaunaLevel4 = require('./importTaxObjectsFaunaLevel4.js')

module.exports = async (asyncCouchdbView, pgDb, taxFauna, couchObjects) => {
  const taxObjectsFaunaLevel1 = await importTaxObjectsFaunaLevel1(
    asyncCouchdbView,
    pgDb,
    taxFauna
  )
  const taxObjectsFaunaLevel2 = await importTaxObjectsFaunaLevel2(
    asyncCouchdbView,
    pgDb,
    taxFauna,
    taxObjectsFaunaLevel1
  )
  const taxObjectsFaunaLevel3 = await importTaxObjectsFaunaLevel3(
    asyncCouchdbView,
    pgDb,
    taxFauna,
    taxObjectsFaunaLevel1,
    taxObjectsFaunaLevel2
  )
  const taxObjectsFaunaLevel4 = await importTaxObjectsFaunaLevel4(
    asyncCouchdbView,
    pgDb,
    taxFauna,
    taxObjectsFaunaLevel1,
    taxObjectsFaunaLevel2,
    taxObjectsFaunaLevel3,
    couchObjects
  )
  const taxObjectsFauna = [
    ...taxObjectsFaunaLevel1,
    ...taxObjectsFaunaLevel2,
    ...taxObjectsFaunaLevel3,
    ...taxObjectsFaunaLevel4,
  ]
  console.log(`${taxObjectsFauna.length} fauna taxonomy objects imported`)

  return taxObjectsFauna
}
