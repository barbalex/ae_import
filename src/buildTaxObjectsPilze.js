'use strict'

const buildTaxObjectsPilzeLevel1 = require(`./buildTaxObjectsPilzeLevel1.js`)
const buildTaxObjectsPilzeLevel2 = require(`./buildTaxObjectsPilzeLevel2.js`)

let taxObjectsPilzeLevel1 = null
let taxObjectsPilzeLevel2 = null

module.exports = (db, taxPilze, objects) =>
  new Promise((resolve, reject) => {
    buildTaxObjectsPilzeLevel1(db, taxPilze)
      .then((result) => {
        taxObjectsPilzeLevel1 = result
        console.log(`taxObjectsPilzeLevel1`, taxObjectsPilzeLevel1.slice(0, 2))
        return buildTaxObjectsPilzeLevel2(db, taxPilze, taxObjectsPilzeLevel1, objects)
      })
      .then((result) => {
        taxObjectsPilzeLevel2 = result
        const taxObjectsPilze = taxObjectsPilzeLevel1.concat(taxObjectsPilzeLevel2)
        console.log(`taxObjectsPilzeLevel2`, taxObjectsPilzeLevel2.slice(0, 2))
        console.log(`finished importing ${taxObjectsPilze.length} pilze taxonomy objects`)
        resolve(taxObjectsPilze)
      })
      .catch((error) => reject(error))
  })
