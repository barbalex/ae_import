'use strict'

const importTaxObjectsMooseLevel1 = require('./importTaxObjectsMooseLevel1')
const importTaxObjectsMooseLevel2 = require('./importTaxObjectsMooseLevel2')
const importTaxObjectsMooseLevel3 = require('./importTaxObjectsMooseLevel3')
const importTaxObjectsMooseLevel4 = require('./importTaxObjectsMooseLevel4')

module.exports = async (asyncCouchdbView, pgDb, taxMoose, couchObjects) => {
  const taxObjectsMooseLevel1 = await importTaxObjectsMooseLevel1(
    asyncCouchdbView,
    pgDb,
    taxMoose
  )
  const taxObjectsMooseLevel2 = await importTaxObjectsMooseLevel2(
    asyncCouchdbView,
    pgDb,
    taxMoose,
    taxObjectsMooseLevel1
  )
  const taxObjectsMooseLevel3 = await importTaxObjectsMooseLevel3(
    asyncCouchdbView,
    pgDb,
    taxMoose,
    taxObjectsMooseLevel1,
    taxObjectsMooseLevel2
  )
  const taxObjectsMooseLevel4 = await importTaxObjectsMooseLevel4(
    asyncCouchdbView,
    pgDb,
    taxMoose,
    taxObjectsMooseLevel1,
    taxObjectsMooseLevel2,
    taxObjectsMooseLevel3,
    couchObjects
  )
  const taxObjectsMoose = [
    ...taxObjectsMooseLevel1,
    ...taxObjectsMooseLevel2,
    ...taxObjectsMooseLevel3,
    ...taxObjectsMooseLevel4,
  ]
  console.log(`${taxObjectsMoose.length} moose taxonomy objects imported`)

  return taxObjectsMoose
}
