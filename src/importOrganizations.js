'use strict'

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    const sql = `insert into ae.organization(name) values ('FNS Kt. ZH');`  /* eslint quotes:0 */
    pgDb.none('truncate ae.organization cascade')
      .then(() => pgDb.none(sql))
      .then(() => {
        console.log('organizations inserted')
        resolve()
      })
      .catch((error) =>
        reject(`error inserting organizations ${error}`)
      )
  })
