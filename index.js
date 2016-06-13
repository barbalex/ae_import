'use strict'

/*
 * Taxonomie-Objekte für LR aufbauen
 *
 * use view baumLr because the order makes sure,
 * parent was always created first
 *
 * for every key in baumLr:
 * 1. create Taxonomie-Objekt from LR-Objekt:
 *    get Name from key[4]
 * 2. get child-object-guids from baumLr: level = level +1, parent = _id
 * 3. set field Taxonomien in Objekt
 *
 * when all are done:
 * create field children, using field child-object-guids
 * then remove field child-object-guids
 *
 */

const couchPass = require(`./couchPass.json`)
const cradle = require(`cradle`)
const connection = new (cradle.Connection)(`127.0.0.1`, 5984, {
  auth: {
    username: couchPass.user,
    password: couchPass.pass
  }
})
const couchDb = connection.database(`artendb`)

const config = require(`./configuration.js`)
const pgp = require(`pg-promise`)()
const pgDb = pgp(config.pg.connectionString)

const getCouchObjects = require(`./src/getCouchObjects.js`)
const importObjects = require(`./src/importObjects.js`)
const importCategories = require(`./src/importCategories.js`)
const importOrganizations = require(`./src/importOrganizations.js`)
const importUsers = require(`./src/importUsers.js`)
const importTaxonomiesNonLr = require(`./src/importTaxonomiesNonLr.js`)
const importTaxonomiesLr = require(`./src/importTaxonomiesLr.js`)
const importTaxObjectsFauna = require(`./src/importTaxObjectsFauna.js`)
const importTaxObjectsFlora = require(`./src/importTaxObjectsFlora.js`)
const importTaxObjectsMoose = require(`./src/importTaxObjectsMoose.js`)
const importTaxObjectsPilze = require(`./src/importTaxObjectsPilze.js`)

let couchObjects
let objects
let taxonomies
let categories
let organizations
let users
let nonLrTaxonomies
let lrTaxonomies
let taxFauna
let taxFlora
let taxMoose
let taxPilze
let taxObjectsFauna
let taxObjectsFlora
let taxObjectsMoose
let taxObjectsPilze
let taxObjectsLebensräume

getCouchObjects(couchDb)
  .then((result) => {
    couchObjects = result
    return importCategories(pgDb)
  })
  .then((result) => {
    categories = result
    return importOrganizations(pgDb)
  })
  .then((result) => {
    organizations = result
    return importUsers(pgDb)
  })
  .then((result) => {
    users = result
    return importTaxonomiesNonLr(pgDb, organizations[0].id)
  })
  .then((result) => {
    nonLrTaxonomies = result
    taxFauna = nonLrTaxonomies.find((tax) =>
      tax.category === `Fauna`
    )
    taxFlora = nonLrTaxonomies.find((tax) =>
      tax.category === `Flora`
    )
    taxMoose = nonLrTaxonomies.find((tax) =>
      tax.category === `Moose`
    )
    taxPilze = nonLrTaxonomies.find((tax) =>
      tax.category === `Pilze`
    )
    return importTaxonomiesLr(couchDb, pgDb, organizations[0].id)
  })
  .then((result) => {
    lrTaxonomies = result
    return importObjects(couchDb, pgDb, couchObjects, organizations[0].id)
  })
  .then((result) => {
    objects = result
    return importTaxObjectsFauna(couchDb, pgDb, taxFauna, couchObjects)
  })
  .then((result) => {
    taxObjectsFauna = result
    return importTaxObjectsFlora(couchDb, pgDb, taxFlora, couchObjects)
  })
  .then((result) => {
    taxObjectsFlora = result
    return importTaxObjectsMoose(couchDb, pgDb, taxMoose, couchObjects)
  })
  .then((result) => {
    taxObjectsMoose = result
    return importTaxObjectsPilze(couchDb, pgDb, taxPilze, couchObjects)
  })
  .then((result) => {
    taxObjectsPilze = result
    pgp.end()
  })
  .catch((error) => {
    console.log(error)
    pgp.end()
  })

/*
const rebuildObjects = require(`./src/rebuildObjects.js`)

getCouchObjects(couchDb)
  .then(() => rebuildObjects(couchDb, lrTaxonomies))
  .catch((error) => console.log(error))
*/
