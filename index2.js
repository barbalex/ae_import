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
const pgDb = pgp(config.pg.connectionString)

const getCouchObjects = require('./src/getCouchObjects.js')
const importObjectPropertyCollections = require('./src/importObjectPropertyCollections.js')

let couchObjects

getCouchObjects(couchDb)
  .then(result => {
    couchObjects = result
    return importObjectPropertyCollections(pgDb, couchObjects)
  })
  .then(() => {
    pgp.end()
  })
  .catch(error => {
    console.log(error)
    pgp.end()
  })
