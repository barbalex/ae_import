'use strict'

const couchPass = require('../couchPass.json')
const cradle = require('cradle')
const connection = new (cradle.Connection)('127.0.0.1', 5984, {
  auth: {
    username: couchPass.user,
    password: couchPass.pass
  }
})
const db = connection.database('artendb')
const setParentInLrTaxObjects = require('./setParentInLrTaxObjects.js')

setParentInLrTaxObjects(db)
