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

const couchPass = require('./couchPass.json')
const cradle = require('cradle')
const connection = new (cradle.Connection)('127.0.0.1', 5984, {
  auth: {
    username: couchPass.user,
    password: couchPass.pass
  }
})
const couchDb = connection.database('artendb')


const pgConnection = require('./dbConnection.js')
const pgp = require('pg-promise')()
const pgDb = pgp(pgConnection)



const getObjects = require('./src/getObjects.js')
const buildTaxonomiesNonLr = require('./src/buildTaxonomiesNonLr.js')
const buildTaxonomiesLr = require('./src/buildTaxonomiesLr.js')
const buildGroups = require('./src/buildGroups.js')
const buildTaxObjectsFauna = require('./src/buildTaxObjectsFauna.js')
const buildTaxObjectsFlora = require('./src/buildTaxObjectsFlora.js')
const buildTaxObjectsPilze = require('./src/buildTaxObjectsPilze.js')
const buildTaxObjectsMoose = require('./src/buildTaxObjectsMoose.js')
const rebuildObjects = require('./src/rebuildObjects.js')

let objects = null
let taxonomies = null
let lrTaxonomies = null
let taxFauna = null
let taxFlora = null
let taxPilze = null

getObjects(couchDb)
  .then((result) => {
    objects = result
    console.log('objects', objects.slice(0, 2))
    return buildTaxonomiesNonLr(couchDb)
  })
  .then((result) => {
    taxonomies = result
    console.log('taxonomies', taxonomies.slice(0, 2))
    return buildTaxonomiesLr(couchDb)
  })
  .then((result) => {
    lrTaxonomies = result
    console.log('lrTaxonomies', lrTaxonomies.slice(0, 2))
    // get id of CSCF (2009)
    taxFauna = taxonomies.find((taxonomy) => taxonomy.Name === 'CSCF (2009)')
    taxFlora = taxonomies.find((taxonomy) => taxonomy.Name === 'SISF Index 2 (2005)')
    taxPilze = taxonomies.find((taxonomy) => taxonomy.Name === 'Swissfunghi (2011)')
    return buildTaxObjectsFauna(couchDb, taxFauna, objects)
  })
  .then(() => buildTaxObjectsFlora(couchDb, taxFlora, objects))
  .then(() => buildTaxObjectsPilze(couchDb, taxPilze, objects))
  .then(() => buildTaxObjectsMoose(couchDb, taxPilze, objects))
  .then(() => rebuildObjects(couchDb, lrTaxonomies))
  .then(() => buildGroups(couchDb))
  .catch((error) => console.log(error))
