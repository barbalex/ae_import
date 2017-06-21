'use strict'

const importTaxObjectsFloraLevel1 = require('./importTaxObjectsFloraLevel1')
const importTaxObjectsFloraLevel2 = require('./importTaxObjectsFloraLevel2')
const importTaxObjectsFloraLevel3 = require('./importTaxObjectsFloraLevel3')

module.exports = async (asyncCouchdbView, pgDb, taxFlora, couchObjects) => {
  const taxObjectsFloraLevel1 = await importTaxObjectsFloraLevel1(
    asyncCouchdbView,
    pgDb,
    taxFlora
  )
  const taxObjectsFloraLevel2 = await importTaxObjectsFloraLevel2(
    asyncCouchdbView,
    pgDb,
    taxFlora,
    taxObjectsFloraLevel1
  )
  const taxObjectsFloraLevel3 = await importTaxObjectsFloraLevel3(
    asyncCouchdbView,
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
