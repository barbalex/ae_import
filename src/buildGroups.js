'use strict'

const getGroups = require('./groups.js')
const groups = getGroups()

module.exports = (db) =>
  new Promise((resolve, reject) => {
    const valueSql = groups.map((group) => `('${group}')`).join(',')
    const sql = `insert into ae.group(name) values ${valueSql};`
    db.none('truncate ae.group cascade')
      .then(() => db.none(sql))
      .then(() => {
        console.log('groups inserted')
        resolve()
      })
      .catch((error) => reject(`error inserting groups ${error}`))
  })
