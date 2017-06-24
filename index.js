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

const { promisify } = require('util')
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
const asyncCouchdbView = promisify(couchDb.view).bind(couchDb)

// initialte postgres-connection
const config = require('./configuration')
const pgp = require('pg-promise')()

const rebuildTables = require('./src/rebuildTables')
const getCouchObjects = require('./src/getCouchObjects')
const importObjects = require('./src/importObjects')
const importCategories = require('./src/importCategories')
const importOrganizations = require('./src/importOrganizations')
const importUsers = require('./src/importUsers')
const importOrganizationUsers = require('./src/importOrganizationUsers')
const importRoles = require('./src/importRoles')
const importTaxonomiesNonLr = require('./src/importTaxonomiesNonLr')
const importTaxonomiesLr = require('./src/importTaxonomiesLr')
const importTaxObjectsFauna = require('./src/importTaxObjectsFauna')
const importTaxObjectsFlora = require('./src/importTaxObjectsFlora')
const importSynonymsFlora = require('./src/importSynonymsFlora')
const importTaxObjectsMoose = require('./src/importTaxObjectsMoose')
const importTaxObjectsPilze = require('./src/importTaxObjectsPilze')
const importTaxObjectsLr = require('./src/importTaxObjectsLr')
const importCollections = require('./src/importCollections')
const correctPropertyCollections = require('./src/correctPropertyCollections')
const correctRelationCollections = require('./src/correctRelationCollections')
const importObjectPropertyCollections = require('./src/importObjectPropertyCollections')
const addUniqueNameConstraintToCollections = require('./src/addUniqueNameConstraintToCollections')
const addTaxonomyObjectParentConstraint = require('./src/addTaxonomyObjectParentConstraint')
const addFunctions = require('./src/addFunctions')
const wait5s = require('./src/wait5s')

const pgDb = pgp(config.pg.connectionString)

async function doIt() {
  try {
    await rebuildTables()
    const couchObjects = await getCouchObjects(asyncCouchdbView)
    // console.log('index: couchObjects[0]:', couchObjects[0])
    await importCategories(pgDb)
    const organizations = await importOrganizations(pgDb)
    const users = await importUsers(pgDb)
    await importRoles(pgDb)
    await importOrganizationUsers(pgDb, organizations[0].id, users)
    const nonLrTaxonomies = await importTaxonomiesNonLr(
      pgDb,
      organizations[0].id
    )
    const taxFauna = nonLrTaxonomies.find(tax => tax.category === 'Fauna')
    const taxFlora = nonLrTaxonomies.find(tax => tax.category === 'Flora')
    const taxMoose = nonLrTaxonomies.find(tax => tax.category === 'Moose')
    const taxPilze = nonLrTaxonomies.find(tax => tax.category === 'Pilze')
    const taxLr = await importTaxonomiesLr(
      asyncCouchdbView,
      pgDb,
      organizations[0].id
    )
    await importObjects(pgDb, couchObjects, organizations[0].id)
    await importTaxObjectsFauna(asyncCouchdbView, pgDb, taxFauna, couchObjects)
    await importTaxObjectsFlora(asyncCouchdbView, pgDb, taxFlora, couchObjects)
    await importSynonymsFlora(pgDb)
    await importTaxObjectsMoose(asyncCouchdbView, pgDb, taxMoose, couchObjects)
    await importTaxObjectsPilze(asyncCouchdbView, pgDb, taxPilze, couchObjects)
    await importTaxObjectsLr(asyncCouchdbView, pgDb, taxLr)
    await importCollections(asyncCouchdbView, pgDb, organizations[0].id, users)
    await correctPropertyCollections(pgDb)
    await correctRelationCollections(pgDb)
    await addUniqueNameConstraintToCollections(pgDb)
    await addFunctions(pgDb)
    await addTaxonomyObjectParentConstraint(pgDb)
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
