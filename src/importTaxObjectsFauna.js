'use strict'

const importTaxObjectsFaunaLevel1 = require(`./importTaxObjectsFaunaLevel1.js`)
const importTaxObjectsFaunaLevel2 = require(`./importTaxObjectsFaunaLevel2.js`)
const importTaxObjectsFaunaLevel3 = require(`./importTaxObjectsFaunaLevel3.js`)
const importTaxObjectsFaunaLevel4 = require(`./importTaxObjectsFaunaLevel4.js`)

let taxObjectsFaunaLevel1
let taxObjectsFaunaLevel2
let taxObjectsFaunaLevel3
let taxObjectsFaunaLevel4

module.exports = (couchDb, pgDb, taxFauna, couchObjects) =>
  new Promise((resolve, reject) => {
    importTaxObjectsFaunaLevel1(couchDb, pgDb, taxFauna)
      .then((result) => {
        taxObjectsFaunaLevel1 = result
        return importTaxObjectsFaunaLevel2(
          couchDb,
          pgDb,
          taxFauna,
          taxObjectsFaunaLevel1
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel2 = result
        return importTaxObjectsFaunaLevel3(
          couchDb,
          pgDb,
          taxFauna,
          taxObjectsFaunaLevel1,
          taxObjectsFaunaLevel2
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel3 = result
        return importTaxObjectsFaunaLevel4(
          couchDb,
          pgDb,
          taxFauna,
          taxObjectsFaunaLevel1,
          taxObjectsFaunaLevel2,
          taxObjectsFaunaLevel3,
          couchObjects
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel4 = result
        const taxObjectsFauna = taxObjectsFaunaLevel1.concat(taxObjectsFaunaLevel2, taxObjectsFaunaLevel3, taxObjectsFaunaLevel4)
        console.log(`${taxObjectsFauna.length} fauna taxonomy objects imported`)
        resolve(taxObjectsFauna)
      })
      .catch((error) => reject(error))
  })
