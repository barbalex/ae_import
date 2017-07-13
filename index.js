'use strict'

/*
 * Taxonomie-Objekte für LR aufbauen
 *
 * use view baumLr because:
 * the order makes sure parent was always created first
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

// initiate postgres-connection
const config = require('./configuration')
const pgp = require('pg-promise')()

const rebuildTables = require('./src/rebuildTables')
const getCouchObjects = require('./src/getCouchObjects')
const importCategories = require('./src/importCategories')
const importOrganizations = require('./src/importOrganizations')
const importUsers = require('./src/importUsers')
const importOrganizationUsers = require('./src/importOrganizationUsers')
const importRoles = require('./src/importRoles')
const importTaxonomiesNonLr = require('./src/importTaxonomiesNonLr')
const importTaxonomiesLr = require('./src/importTaxonomiesLr')
const importObjectsFauna = require('./src/importObjectsFauna')
const importObjectsFlora = require('./src/importObjectsFlora')
const importSynonymsFlora = require('./src/importSynonymsFlora')
const importObjectsMoose = require('./src/importObjectsMoose')
const importSynonymsMoose = require('./src/importSynonymsMoose')
const importObjectsPilze = require('./src/importObjectsPilze')
const importObjectsLr = require('./src/importObjectsLr')
const importCollections = require('./src/importCollections')
const correctPropertyCollections = require('./src/correctPropertyCollections')
const importPropertyCollectionObjectsFromPC = require('./src/importPropertyCollectionObjectsFromPC')
const importPropertyCollectionObjectsFromRC = require('./src/importPropertyCollectionObjectsFromRC')
const addUniqueNameConstraintToCollections = require('./src/addUniqueNameConstraintToCollections')
const addTaxonomyObjectParentConstraint = require('./src/addTaxonomyObjectParentConstraint')
const addFunctions = require('./src/addFunctions')

const pgDb = pgp(config.pg.connectionString)

const doIt = async () => {
  try {
    await rebuildTables()
    const couchObjects = await getCouchObjects(asyncCouchdbView)
    await importCategories(pgDb)
    const organizations = await importOrganizations(pgDb)
    const users = await importUsers(pgDb)
    await importRoles(pgDb)
    await importOrganizationUsers(pgDb, organizations[0].id, users)
    await importTaxonomiesNonLr(pgDb, organizations[0].id, users)
    await importTaxonomiesLr(asyncCouchdbView, pgDb, organizations[0].id, users)
    await importObjectsFauna(asyncCouchdbView, pgDb, couchObjects)
    await importObjectsFlora(asyncCouchdbView, pgDb, couchObjects)
    await importSynonymsFlora(pgDb)
    await importObjectsMoose(asyncCouchdbView, pgDb, couchObjects)

    await importSynonymsMoose(pgDb)
    await importObjectsPilze(asyncCouchdbView, pgDb, couchObjects)
    await importObjectsLr(asyncCouchdbView, pgDb)
    await importCollections(asyncCouchdbView, pgDb, organizations[0].id, users)
    await correctPropertyCollections(pgDb)
    await addUniqueNameConstraintToCollections(pgDb)
    await addFunctions(pgDb)
    await addTaxonomyObjectParentConstraint(pgDb)
    await importPropertyCollectionObjectsFromPC(pgDb, couchObjects)
    await importPropertyCollectionObjectsFromRC(pgDb, couchObjects)
    return pgp.end()
  } catch (error) {
    console.log(error)
    pgp.end()
  }
}

doIt()
