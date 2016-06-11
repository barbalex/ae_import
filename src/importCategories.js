'use strict'

const categories = require('./categories.js')()

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    const valueSql = categories.map((category) => `('${category}')`).join(',')
    const sql = `insert into ae.category(name) values ${valueSql};`
    pgDb.none('truncate ae.category cascade')
      .then(() => pgDb.none(sql))
      .then(() => pgDb.many('select * from ae.category'))
      .then((categories) => {
        console.log('categories inserted')
        resolve(categories)
      })
      .catch((error) =>
        reject(`error inserting categories ${error}`)
      )
  })
