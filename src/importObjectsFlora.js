'use strict'

const importObjectsFloraLevel1 = require('./importObjectsFloraLevel1')
const importObjectsFloraLevel2 = require('./importObjectsFloraLevel2')
const importObjectsFloraLevel3 = require('./importObjectsFloraLevel3')

module.exports = async (asyncCouchdbView, pgDb, taxFlora, couchObjects) => {
  const taxObjectsFloraLevel1 = await importObjectsFloraLevel1(
    asyncCouchdbView,
    pgDb,
    taxFlora
  )
  const taxObjectsFloraLevel2 = await importObjectsFloraLevel2(
    asyncCouchdbView,
    pgDb,
    taxFlora,
    taxObjectsFloraLevel1
  )
  const taxObjectsFloraLevel3 = await importObjectsFloraLevel3(
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