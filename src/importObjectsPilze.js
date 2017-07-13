'use strict'

const importObjectsPilzeLevel1 = require('./importObjectsPilzeLevel1')
const importObjectsPilzeLevel2 = require('./importObjectsPilzeLevel2')

module.exports = async (asyncCouchdbView, pgDb, couchObjects) => {
  const taxPilze = await pgDb.one(
    `select * from ae.taxonomy where name = 'NISM (2010)'`
  )
  const taxObjectsPilzeLevel1 = await importObjectsPilzeLevel1(
    asyncCouchdbView,
    pgDb,
    taxPilze
  )
  const taxObjectsPilzeLevel2 = await importObjectsPilzeLevel2(
    asyncCouchdbView,
    pgDb,
    taxPilze,
    taxObjectsPilzeLevel1,
    couchObjects
  )
  const taxObjectsPilze = [...taxObjectsPilzeLevel1, ...taxObjectsPilzeLevel2]
  console.log(`${taxObjectsPilze.length} pilze taxonomy objects imported`)

  return taxObjectsPilze
}
