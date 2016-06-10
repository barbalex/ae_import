'use strict'

const buildTaxObjectsFaunaLevel1 = require('./buildTaxObjectsFaunaLevel1.js')
const buildTaxObjectsFaunaLevel2 = require('./buildTaxObjectsFaunaLevel2.js')
const buildTaxObjectsFaunaLevel3 = require('./buildTaxObjectsFaunaLevel3.js')
const buildTaxObjectsFaunaLevel4 = require('./buildTaxObjectsFaunaLevel4.js')

let taxObjectsFaunaLevel1 = null
let taxObjectsFaunaLevel2 = null
let taxObjectsFaunaLevel3 = null
let taxObjectsFaunaLevel4 = null

module.exports = (db, taxFauna, objects) =>
  new Promise((resolve, reject) => {
    buildTaxObjectsFaunaLevel1(db, taxFauna)
      .then((result) => {
        taxObjectsFaunaLevel1 = result
        console.log('taxObjectsFaunaLevel1', taxObjectsFaunaLevel1.slice(0, 2))
        return buildTaxObjectsFaunaLevel2(
          db,
          taxFauna,
          taxObjectsFaunaLevel1
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel2 = result
        console.log('taxObjectsFaunaLevel2', taxObjectsFaunaLevel2.slice(0, 2))
        return buildTaxObjectsFaunaLevel3(
          db,
          taxFauna,
          taxObjectsFaunaLevel1,
          taxObjectsFaunaLevel2
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel3 = result
        console.log('taxObjectsFaunaLevel3', taxObjectsFaunaLevel3.slice(0, 2))
        return buildTaxObjectsFaunaLevel4(
          db,
          taxFauna,
          taxObjectsFaunaLevel1,
          taxObjectsFaunaLevel2,
          taxObjectsFaunaLevel3,
          objects
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel4 = result
        console.log('taxObjectsFaunaLevel4', taxObjectsFaunaLevel4.slice(0, 2))
        console.log('finished building fauna objects')
        resolve(
          taxObjectsFaunaLevel1,
          taxObjectsFaunaLevel2,
          taxObjectsFaunaLevel3,
          taxObjectsFaunaLevel4
        )
      })
      .catch((error) => reject(error))
  })
