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

const getObjects = require(`./src/getObjects.js`)
const importCategories = require(`./src/importCategories.js`)
const importOrganizations = require(`./src/importOrganizations.js`)
const importUsers = require(`./src/importUsers.js`)
const importTaxonomiesNonLr = require(`./src/importTaxonomiesNonLr.js`)
const importTaxonomiesLr = require(`./src/importTaxonomiesLr.js`)
const importTaxObjectsFauna = require(`./src/importTaxObjectsFauna.js`)

let objects
let taxonomies
let categories
let organizations
let users
let nonLrTaxonomies
let lrTaxonomies
let taxFauna
let taxFlora
let taxPilze
let taxObjectsFauna
let taxObjectsFlora
let taxObjectsMoose
let taxObjectsPilze
let taxObjectsLebensräume

getObjects(couchDb)
  .then((result) => {
    objects = result
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
    taxFauna = nonLrTaxonomies.find((taxonomy) => taxonomy.name === `CSCF (2009)`)
    taxFlora = nonLrTaxonomies.find((taxonomy) => taxonomy.name === `SISF Index 2 (2005)`)
    taxPilze = nonLrTaxonomies.find((taxonomy) => taxonomy.name === `Swissfunghi (2011)`)
    return importTaxonomiesLr(couchDb, pgDb, organizations[0].id)
  })
  .then((result) => {
    lrTaxonomies = result
    return importTaxObjectsFauna(couchDb, pgDb, taxFauna, objects)
  })
  .then((result) => {
    taxObjectsFauna = result
    pgp.end()
  })
  .catch((error) => {
    console.log(error)
    pgp.end()
  })

/*


const buildTaxObjectsFlora = require(`./src/buildTaxObjectsFlora.js`)
const buildTaxObjectsPilze = require(`./src/buildTaxObjectsPilze.js`)
const buildTaxObjectsMoose = require(`./src/buildTaxObjectsMoose.js`)
const rebuildObjects = require(`./src/rebuildObjects.js`)

getObjects(couchDb)
  .then(() => buildTaxObjectsFlora(couchDb, taxFlora, objects))
  .then(() => buildTaxObjectsPilze(couchDb, taxPilze, objects))
  .then(() => buildTaxObjectsMoose(couchDb, taxPilze, objects))
  .then(() => rebuildObjects(couchDb, lrTaxonomies))
  .catch((error) => console.log(error))
*/