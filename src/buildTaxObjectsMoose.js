'use strict'

const buildTaxObjectsMooseLevel1 = require('./buildTaxObjectsMooseLevel1.js')
const buildTaxObjectsMooseLevel2 = require('./buildTaxObjectsMooseLevel2.js')
const buildTaxObjectsMooseLevel3 = require('./buildTaxObjectsMooseLevel3.js')
const buildTaxObjectsMooseLevel4 = require('./buildTaxObjectsMooseLevel4.js')

let taxObjectsMooseLevel1 = null
let taxObjectsMooseLevel2 = null
let taxObjectsMooseLevel3 = null
let taxObjectsMooseLevel4 = null

module.exports = (db, taxMoose, objects) =>
  new Promise((resolve, reject) => {
    buildTaxObjectsMooseLevel1(db, taxMoose)
      .then((result) => {
        taxObjectsMooseLevel1 = result
        console.log('taxObjectsMooseLevel1', taxObjectsMooseLevel1.slice(0, 2))
        return buildTaxObjectsMooseLevel2(
          db,
          taxMoose,
          taxObjectsMooseLevel1
        )
      })
      .then((result) => {
        taxObjectsMooseLevel2 = result
        console.log('taxObjectsMooseLevel2', taxObjectsMooseLevel2.slice(0, 2))
        return buildTaxObjectsMooseLevel3(
          db,
          taxMoose,
          taxObjectsMooseLevel1,
          taxObjectsMooseLevel2
        )
      })
      .then((result) => {
        taxObjectsMooseLevel3 = result
        console.log('taxObjectsMooseLevel3', taxObjectsMooseLevel3.slice(0, 2))
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
        console.log('taxObjectsMooseLevel4', taxObjectsMooseLevel4.slice(0, 2))
        console.log('finished building moose objects')
        resolve(
          taxObjectsMooseLevel1,
          taxObjectsMooseLevel2,
          taxObjectsMooseLevel3,
          taxObjectsMooseLevel4
        )
      })
      .catch((error) => reject(error))
  })
