'use strict'

const buildTaxObjectsPilzeLevel1 = require('./buildTaxObjectsPilzeLevel1.js')
const buildTaxObjectsPilzeLevel2 = require('./buildTaxObjectsPilzeLevel2.js')

let taxObjectsPilzeLevel1 = null
let taxObjectsPilzeLevel2 = null

module.exports = (db, taxPilze, objects) =>
  new Promise((resolve, reject) => {
    buildTaxObjectsPilzeLevel1(db, taxPilze)
      .then((result) => {
        taxObjectsPilzeLevel1 = result
        console.log('taxObjectsPilzeLevel1', taxObjectsPilzeLevel1.slice(0, 2))
        return buildTaxObjectsPilzeLevel2(db, taxPilze, taxObjectsPilzeLevel1, objects)
      })
      .then((result) => {
        taxObjectsPilzeLevel2 = result
        console.log('taxObjectsPilzeLevel2', taxObjectsPilzeLevel2.slice(0, 2))
        console.log('finished building pilze objects')
        resolve(taxObjectsPilzeLevel1, taxObjectsPilzeLevel2)
      })
      .catch((error) => reject(error))
  })
