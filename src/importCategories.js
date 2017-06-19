'use strict'

const categories = require('./categories')

module.exports = async pgDb => {
  const valueSql = categories.map(category => `('${category}')`).join(',')
  const sql = `
    insert into
      ae.category (name)
    values
      ${valueSql};`

  await pgDb.none('truncate ae.category cascade')
  await pgDb.none(sql)
  const cat = await pgDb.many('select * from ae.category')
  console.log(`${categories.length} categories imported`)
  return cat
}
