'use strict'

const importObjectsFaunaLevel1 = require('./importObjectsFaunaLevel1')
const importObjectsFaunaLevel2 = require('./importObjectsFaunaLevel2')
const importObjectsFaunaLevel3 = require('./importObjectsFaunaLevel3')
const importObjectsFaunaLevel4 = require('./importObjectsFaunaLevel4')

module.exports = async (asyncCouchdbView, pgDb, couchObjects) => {
  const taxFauna = await pgDb.one(
    `select * from ae.taxonomy where name = 'CSCF (2009)'`
  )
  const objectsFaunaLevel1 = await importObjectsFaunaLevel1(
    asyncCouchdbView,
    pgDb,
    taxFauna
  )
  const objectsFaunaLevel2 = await importObjectsFaunaLevel2(
    asyncCouchdbView,
    pgDb,
    taxFauna,
    objectsFaunaLevel1
  )
  const objectsFaunaLevel3 = await importObjectsFaunaLevel3(
    asyncCouchdbView,
    pgDb,
    taxFauna,
    objectsFaunaLevel1,
    objectsFaunaLevel2
  )
  const objectsFaunaLevel4 = await importObjectsFaunaLevel4(
    asyncCouchdbView,
    pgDb,
    taxFauna,
    objectsFaunaLevel1,
    objectsFaunaLevel2,
    objectsFaunaLevel3,
    couchObjects
  )
  const taxObjectsFauna = [
    ...objectsFaunaLevel1,
    ...objectsFaunaLevel2,
    ...objectsFaunaLevel3,
    ...objectsFaunaLevel4,
  ]
  console.log(`${taxObjectsFauna.length} fauna objects imported`)

  return taxObjectsFauna
}
