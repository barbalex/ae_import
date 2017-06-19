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

// initiate couchDb-connection
const couchPass = require('./couchPass.json')
const cradle = require('cradle')

const connection = new cradle.Connection('127.0.0.1', 5984, {
  auth: {
    username: couchPass.user,
    password: couchPass.pass,
  },
})
const couchDb = connection.database('artendb')

// initialte postgres-connection
const config = require('./configuration.js')
const pgp = require('pg-promise')()

const rebuildTables = require('./src/rebuildTables.js')
const getCouchObjects = require('./src/getCouchObjects.js')
const importObjects = require('./src/importObjects.js')
const importCategories = require('./src/importCategories.js')
const importOrganizations = require('./src/importOrganizations.js')
const importUsers = require('./src/importUsers.js')
const importOrganizationUsers = require('./src/importOrganizationUsers.js')
const importRoles = require('./src/importRoles.js')
const importTaxonomiesNonLr = require('./src/importTaxonomiesNonLr.js')
const importTaxonomiesLr = require('./src/importTaxonomiesLr.js')
const importTaxObjectsFauna = require('./src/importTaxObjectsFauna.js')
const importTaxObjectsFlora = require('./src/importTaxObjectsFlora.js')
const importTaxObjectsMoose = require('./src/importTaxObjectsMoose.js')
const importTaxObjectsPilze = require('./src/importTaxObjectsPilze.js')
const importTaxObjectsLr = require('./src/importTaxObjectsLr.js')
const importCollections = require('./src/importCollections.js')
const correctPropertyCollections = require('./src/correctPropertyCollections.js')
const correctRelationCollections = require('./src/correctRelationCollections.js')
const importObjectPropertyCollections = require('./src/importObjectPropertyCollections.js')
const addUniqueNameConstraintToCollections = require('./src/addUniqueNameConstraintToCollections.js')
const wait5s = require('./src/wait5s.js')

const pgDb = pgp(config.pg.connectionString)

async function doIt() {
  try {
    await rebuildTables()
    const couchObjects = await getCouchObjects(couchDb)
    await importCategories(pgDb)
    const organizations = await importOrganizations(pgDb)
    const users = await importUsers(pgDb)
    await importRoles(pgDb)
    await importOrganizationUsers(pgDb, organizations[0].id, users)
    const nonLrTaxonomies = importTaxonomiesNonLr(pgDb, organizations[0].id)
    const taxFauna = nonLrTaxonomies.find(tax => tax.category === 'Fauna')
    const taxFlora = nonLrTaxonomies.find(tax => tax.category === 'Flora')
    const taxMoose = nonLrTaxonomies.find(tax => tax.category === 'Moose')
    const taxPilze = nonLrTaxonomies.find(tax => tax.category === 'Pilze')
    const taxLr = await importTaxonomiesLr(couchDb, pgDb, organizations[0].id)
    await importObjects(couchDb, pgDb, couchObjects, organizations[0].id)
    await importTaxObjectsFauna(couchDb, pgDb, taxFauna, couchObjects)
    await importTaxObjectsFlora(couchDb, pgDb, taxFlora, couchObjects)
    await importTaxObjectsMoose(couchDb, pgDb, taxMoose, couchObjects)
    await importTaxObjectsPilze(couchDb, pgDb, taxPilze, couchObjects)
    await importTaxObjectsLr(couchDb, pgDb, taxLr, couchObjects)
    await importCollections(couchDb, pgDb, organizations[0].id, users)
    await correctPropertyCollections(pgDb)
    await correctRelationCollections(pgDb)
    await addUniqueNameConstraintToCollections(pgDb)
    // dont know why but when next is done directly after above
    // an error occurs...
    await wait5s()
    await wait5s()
    await wait5s()
    await wait5s()
    await importObjectPropertyCollections(pgDb, couchObjects)
    await pgp.end()
  } catch (error) {
    console.log(error)
    pgp.end()
  }
}

doIt()
