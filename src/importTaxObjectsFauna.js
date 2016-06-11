'use strict'

const importTaxObjectsFaunaLevel1 = require(`./importTaxObjectsFaunaLevel1.js`)
const importTaxObjectsFaunaLevel2 = require(`./importTaxObjectsFaunaLevel2.js`)
const importTaxObjectsFaunaLevel3 = require(`./importTaxObjectsFaunaLevel3.js`)
const importTaxObjectsFaunaLevel4 = require(`./importTaxObjectsFaunaLevel4.js`)

let taxObjectsFaunaLevel1 = null
let taxObjectsFaunaLevel2 = null
let taxObjectsFaunaLevel3 = null
let taxObjectsFaunaLevel4 = null

module.exports = (couchDb, pgDb, taxFauna, objects) =>
  new Promise((resolve, reject) => {
    importTaxObjectsFaunaLevel1(couchDb, pgDb, taxFauna)
      .then((result) => {
        taxObjectsFaunaLevel1 = result
        console.log(`taxObjectsFaunaLevel1`, taxObjectsFaunaLevel1.slice(0, 2))
        return importTaxObjectsFaunaLevel2(
          couchDb,
          pgDb,
          taxFauna,
          taxObjectsFaunaLevel1
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel2 = result
        console.log(`taxObjectsFaunaLevel2`, taxObjectsFaunaLevel2.slice(0, 2))
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
        console.log(`taxObjectsFaunaLevel3`, taxObjectsFaunaLevel3.slice(0, 2))
        return importTaxObjectsFaunaLevel4(
          couchDb,
          pgDb,
          taxFauna,
          taxObjectsFaunaLevel1,
          taxObjectsFaunaLevel2,
          taxObjectsFaunaLevel3,
          objects
        )
      })
      .then((result) => {
        taxObjectsFaunaLevel4 = result
        console.log(`taxObjectsFaunaLevel4`, taxObjectsFaunaLevel4.slice(0, 2))
        console.log(`finished building fauna objects`)
        resolve(
          taxObjectsFaunaLevel1,
          taxObjectsFaunaLevel2,
          taxObjectsFaunaLevel3,
          taxObjectsFaunaLevel4
        )
      })
      .catch((error) => reject(error))
  })
