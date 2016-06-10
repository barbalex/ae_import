'use strict'

const buildTaxObjectsFloraLevel1 = require('./buildTaxObjectsFloraLevel1.js')
const buildTaxObjectsFloraLevel2 = require('./buildTaxObjectsFloraLevel2.js')
const buildTaxObjectsFloraLevel3 = require('./buildTaxObjectsFloraLevel3.js')

let taxObjectsFloraLevel1 = null
let taxObjectsFloraLevel2 = null
let taxObjectsFloraLevel3 = null

module.exports = (db, taxFlora, objects) =>
  new Promise((resolve, reject) => {
    buildTaxObjectsFloraLevel1(db, taxFlora)
      .then((result) => {
        taxObjectsFloraLevel1 = result
        console.log('taxObjectsFloraLevel1', taxObjectsFloraLevel1.slice(0, 2))
        return buildTaxObjectsFloraLevel2(db, taxFlora, taxObjectsFloraLevel1)
      })
      .then((result) => {
        taxObjectsFloraLevel2 = result
        console.log('taxObjectsFloraLevel2', taxObjectsFloraLevel2.slice(0, 2))
        return buildTaxObjectsFloraLevel3(db, taxFlora, taxObjectsFloraLevel1, taxObjectsFloraLevel2, objects)
      })
      .then((result) => {
        taxObjectsFloraLevel3 = result
        console.log('taxObjectsFloraLevel3', taxObjectsFloraLevel3.slice(0, 2))
        console.log('finished building flora objects')
        resolve(taxObjectsFloraLevel1, taxObjectsFloraLevel2, taxObjectsFloraLevel3)
      })
      .catch((error) => reject(error))
  })
