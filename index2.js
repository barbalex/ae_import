'use strict'

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
const config = require('./configuration.js')
const pgp = require('pg-promise')()

const pgDb = pgp(config.pg.connectionString)

const getCouchObjects = require('./src/getCouchObjects.js')
const importObjectPropertyCollections = require('./src/importObjectPropertyCollections.js')

async function doIt() {
  try {
    const couchObjects = await getCouchObjects(asyncCouchdbView)
    await importObjectPropertyCollections(pgDb, couchObjects)
  } catch (error) {
    console.log(error)
    pgp.end()
  }
}

doIt()
