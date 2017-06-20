'use strict'

const categories = require('./categories')

module.exports = async pgDb => {
  await pgDb.none('truncate ae.category cascade')
  const valueSql = categories.map(category => `('${category}')`).join(',')
  await pgDb.none(`insert into ae.category (name) values ${valueSql};`)
  const cat = await pgDb.many('select * from ae.category')
  console.log(`${categories.length} categories imported`)

  return cat
}
