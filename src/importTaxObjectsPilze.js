'use strict'

const importTaxObjectsPilzeLevel1 = require('./importTaxObjectsPilzeLevel1.js')
const importTaxObjectsPilzeLevel2 = require('./importTaxObjectsPilzeLevel2.js')

module.exports = (couchDb, pgDb, taxPilze, couchObjects) =>
  new Promise((resolve, reject) => {
    let taxObjectsPilzeLevel1
    let taxObjectsPilzeLevel2

    importTaxObjectsPilzeLevel1(couchDb, pgDb, taxPilze)
      .then(result => {
        taxObjectsPilzeLevel1 = result
        return importTaxObjectsPilzeLevel2(
          couchDb,
          pgDb,
          taxPilze,
          taxObjectsPilzeLevel1,
          couchObjects
        )
      })
      .then(result => {
        taxObjectsPilzeLevel2 = result
        const taxObjectsPilze = taxObjectsPilzeLevel1.concat(
          taxObjectsPilzeLevel2
        )
        console.log(`${taxObjectsPilze.length} pilze taxonomy objects imported`)
        resolve(taxObjectsPilze)
      })
      .catch(error => reject(error))
  })
