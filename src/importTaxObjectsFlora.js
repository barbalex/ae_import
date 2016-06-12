'use strict'

const importTaxObjectsFloraLevel1 = require(`./importTaxObjectsFloraLevel1.js`)
const importTaxObjectsFloraLevel2 = require(`./importTaxObjectsFloraLevel2.js`)
const importTaxObjectsFloraLevel3 = require(`./importTaxObjectsFloraLevel3.js`)

module.exports = (couchDb, pgDb, taxFlora, couchObjects) =>
  new Promise((resolve, reject) => {
    let taxObjectsFloraLevel1
    let taxObjectsFloraLevel2
    let taxObjectsFloraLevel3

    importTaxObjectsFloraLevel1(couchDb, pgDb, taxFlora)
      .then((result) => {
        taxObjectsFloraLevel1 = result
        return importTaxObjectsFloraLevel2(
          couchDb,
          pgDb,
          taxFlora,
          taxObjectsFloraLevel1
        )
      })
      .then((result) => {
        taxObjectsFloraLevel2 = result
        return importTaxObjectsFloraLevel3(
          couchDb,
          pgDb,
          taxFlora,
          taxObjectsFloraLevel1,
          taxObjectsFloraLevel2,
          couchObjects
        )
      })
      .then((result) => {
        taxObjectsFloraLevel3 = result
        const taxObjectsFlora = taxObjectsFloraLevel1.concat(taxObjectsFloraLevel2, taxObjectsFloraLevel3)
        console.log(`${taxObjectsFlora.length} flora taxonomy objects imported`)
        resolve(taxObjectsFlora)
      })
      .catch((error) => reject(error))
  })
