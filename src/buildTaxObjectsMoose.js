'use strict'

const buildTaxObjectsMooseLevel1 = require(`./buildTaxObjectsMooseLevel1.js`)
const buildTaxObjectsMooseLevel2 = require(`./buildTaxObjectsMooseLevel2.js`)
const buildTaxObjectsMooseLevel3 = require(`./buildTaxObjectsMooseLevel3.js`)
const buildTaxObjectsMooseLevel4 = require(`./buildTaxObjectsMooseLevel4.js`)

let taxObjectsMooseLevel1 = null
let taxObjectsMooseLevel2 = null
let taxObjectsMooseLevel3 = null
let taxObjectsMooseLevel4 = null

module.exports = (db, taxMoose, objects) =>
  new Promise((resolve, reject) => {
    buildTaxObjectsMooseLevel1(db, taxMoose)
      .then((result) => {
        taxObjectsMooseLevel1 = result
        return buildTaxObjectsMooseLevel2(
          db,
          taxMoose,
          taxObjectsMooseLevel1
        )
      })
      .then((result) => {
        taxObjectsMooseLevel2 = result
        return buildTaxObjectsMooseLevel3(
          db,
          taxMoose,
          taxObjectsMooseLevel1,
          taxObjectsMooseLevel2
        )
      })
      .then((result) => {
        taxObjectsMooseLevel3 = result
        return buildTaxObjectsMooseLevel4(
          db,
          taxMoose,
          taxObjectsMooseLevel1,
          taxObjectsMooseLevel2,
          taxObjectsMooseLevel3,
          objects
        )
      })
      .then((result) => {
        taxObjectsMooseLevel4 = result
        const taxObjectsMoose = taxObjectsMooseLevel1.concat(taxObjectsMooseLevel2, taxObjectsMooseLevel3, taxObjectsMooseLevel4)
        console.log(`finished importing ${taxObjectsMoose.length} moose taxonomy objects`)
        resolve(taxObjectsMoose)
      })
      .catch((error) => reject(error))
  })
