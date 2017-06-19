'use strict'

module.exports = pgDb =>
  new Promise((resolve, reject) => {
    const sql = `
    insert into
      ae.role (name)
    values
      ('orgAdmin'),
      ('orgHabitatWriter'),
      ('orgCollectionWriter');`
    pgDb
      .none('truncate ae.role cascade')
      .then(() => pgDb.none(sql))
      .then(() => {
        console.log('3 roles imported')
        resolve()
      })
      .catch(error => reject(`error importing roles ${error}`))
  })
