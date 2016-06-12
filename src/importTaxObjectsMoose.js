'use strict'

const importTaxObjectsMooseLevel1 = require(`./importTaxObjectsMooseLevel1.js`)
const importTaxObjectsMooseLevel2 = require(`./importTaxObjectsMooseLevel2.js`)
const importTaxObjectsMooseLevel3 = require(`./importTaxObjectsMooseLevel3.js`)
const importTaxObjectsMooseLevel4 = require(`./importTaxObjectsMooseLevel4.js`)

module.exports = (couchDb, pgDb, taxMoose, couchObjects) =>
  new Promise((resolve, reject) => {
    let taxObjectsMooseLevel1
    let taxObjectsMooseLevel2
    let taxObjectsMooseLevel3
    let taxObjectsMooseLevel4

    importTaxObjectsMooseLevel1(couchDb, pgDb, taxMoose)
      .then((result) => {
        taxObjectsMooseLevel1 = result
        return importTaxObjectsMooseLevel2(
          couchDb,
          pgDb,
          taxMoose,
          taxObjectsMooseLevel1
        )
      })
      .then((result) => {
        taxObjectsMooseLevel2 = result
        return importTaxObjectsMooseLevel3(
          couchDb,
          pgDb,
          taxMoose,
          taxObjectsMooseLevel1,
          taxObjectsMooseLevel2
        )
      })
      .then((result) => {
        taxObjectsMooseLevel3 = result
        return importTaxObjectsMooseLevel4(
          couchDb,
          pgDb,
          taxMoose,
          taxObjectsMooseLevel1,
          taxObjectsMooseLevel2,
          taxObjectsMooseLevel3,
          couchObjects
        )
      })
      .then((result) => {
        taxObjectsMooseLevel4 = result
        const taxObjectsMoose = taxObjectsMooseLevel1.concat(taxObjectsMooseLevel2, taxObjectsMooseLevel3, taxObjectsMooseLevel4)
        console.log(`${taxObjectsMoose.length} moose taxonomy objects imported`)
        resolve(taxObjectsMoose)
      })
      .catch((error) => reject(error))
  })
