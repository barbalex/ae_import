'use strict'

const categories = require('./categories')

module.exports = pgDb => {
  const valueSql = categories.map(category => `('${category}')`).join(',')
  const sql = `
    insert into
      ae.category (name)
    values
      ${valueSql};`
  return pgDb
    .none('truncate ae.category cascade')
    .then(() => pgDb.none(sql))
    .then(() => pgDb.many('select * from ae.category'))
    .then(cat => {
      console.log(`${categories.length} categories imported`)
      return cat
    })
}
