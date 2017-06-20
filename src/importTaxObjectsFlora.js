'use strict'

const importTaxObjectsFloraLevel1 = require('./importTaxObjectsFloraLevel1.js')
const importTaxObjectsFloraLevel2 = require('./importTaxObjectsFloraLevel2.js')
const importTaxObjectsFloraLevel3 = require('./importTaxObjectsFloraLevel3.js')

module.exports = async (couchDb, pgDb, taxFlora, couchObjects) => {
  const taxObjectsFloraLevel1 = await importTaxObjectsFloraLevel1(
    couchDb,
    pgDb,
    taxFlora
  )
  const taxObjectsFloraLevel2 = await importTaxObjectsFloraLevel2(
    couchDb,
    pgDb,
    taxFlora,
    taxObjectsFloraLevel1
  )
  const taxObjectsFloraLevel3 = await importTaxObjectsFloraLevel3(
    couchDb,
    pgDb,
    taxFlora,
    taxObjectsFloraLevel1,
    taxObjectsFloraLevel2,
    couchObjects
  )
  const taxObjectsFlora = [
    ...taxObjectsFloraLevel1,
    ...taxObjectsFloraLevel2,
    ...taxObjectsFloraLevel3,
  ]
  console.log(`${taxObjectsFlora.length} flora taxonomy objects imported`)
  return taxObjectsFlora
}
