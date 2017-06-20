'use strict'

const importTaxObjectsPilzeLevel1 = require('./importTaxObjectsPilzeLevel1.js')
const importTaxObjectsPilzeLevel2 = require('./importTaxObjectsPilzeLevel2.js')

module.exports = async (couchDb, pgDb, taxPilze, couchObjects) => {
  const taxObjectsPilzeLevel1 = await importTaxObjectsPilzeLevel1(
    couchDb,
    pgDb,
    taxPilze
  )
  const taxObjectsPilzeLevel2 = await importTaxObjectsPilzeLevel2(
    couchDb,
    pgDb,
    taxPilze,
    taxObjectsPilzeLevel1,
    couchObjects
  )
  const taxObjectsPilze = [...taxObjectsPilzeLevel1, ...taxObjectsPilzeLevel2]
  console.log(`${taxObjectsPilze.length} pilze taxonomy objects imported`)

  return taxObjectsPilze
}
