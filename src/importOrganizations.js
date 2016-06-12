'use strict'

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    const sql = `
    insert into
      ae.organization (name)
    values
      ('FNS Kt. ZH');`
    pgDb.none(`truncate ae.organization cascade`)
      .then(() => pgDb.none(sql))
      .then(() => pgDb.many(`select * from ae.organization`))
      .then((organizations) => {
        console.log(`1 organization inserted`)
        resolve(organizations)
      })
      .catch((error) =>
        reject(`error inserting organizations ${error}`)
      )
  })
