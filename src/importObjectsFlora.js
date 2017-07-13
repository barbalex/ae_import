'use strict'

const importObjectsFloraLevel1 = require('./importObjectsFloraLevel1')
const importObjectsFloraLevel2 = require('./importObjectsFloraLevel2')
const importObjectsFloraLevel3 = require('./importObjectsFloraLevel3')

module.exports = async (asyncCouchdbView, pgDb, couchObjects) => {
  const taxFlora = await pgDb.one(
    `select * from ae.taxonomy where name = 'SISF Index 2 (2005)'`
  )
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
  console.log(`${taxObjectsFlora.length} flora objects imported`)
  return taxObjectsFlora
}
