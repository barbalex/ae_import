'use strict'

const importObjectsMooseLevel1 = require('./importObjectsMooseLevel1')
const importObjectsMooseLevel2 = require('./importObjectsMooseLevel2')
const importObjectsMooseLevel3 = require('./importObjectsMooseLevel3')
const importObjectsMooseLevel4 = require('./importObjectsMooseLevel4')

module.exports = async (asyncCouchdbView, pgDb, taxMoose, couchObjects) => {
  const taxObjectsMooseLevel1 = await importObjectsMooseLevel1(
    asyncCouchdbView,
    pgDb,
    taxMoose
  )
  const taxObjectsMooseLevel2 = await importObjectsMooseLevel2(
    asyncCouchdbView,
    pgDb,
    taxMoose,
    taxObjectsMooseLevel1
  )
  const taxObjectsMooseLevel3 = await importObjectsMooseLevel3(
    asyncCouchdbView,
    pgDb,
    taxMoose,
    taxObjectsMooseLevel1,
    taxObjectsMooseLevel2
  )
  const taxObjectsMooseLevel4 = await importObjectsMooseLevel4(
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
