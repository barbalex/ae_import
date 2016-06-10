'use strict'

const groups = require('./groups.js')()

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    const valueSql = groups.map((group) => `('${group}')`).join(',')
    const sql = `insert into ae.group(name) values ${valueSql};`
    pgDb.none('truncate ae.group cascade')
      .then(() => pgDb.none(sql))
      .then(() => {
        console.log('groups inserted')
        resolve()
      })
      .catch((error) =>
        reject(`error inserting groups ${error}`)
      )
  })
