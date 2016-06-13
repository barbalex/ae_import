'use strict'

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    const sql = `
    insert into
      ae.user (name, email)
    values
      ('Alexander Gabriel', 'alex@gabriel-software.ch'),
      ('Andreas Lienhard', 'andreas.lienhard@bd.zh.ch');`
    pgDb.none(`truncate ae.user cascade`)
      .then(() => pgDb.none(sql))
      .then(() => pgDb.many(`select * from ae.user`))
      .then((users) => {
        console.log(`1 user imported`)
        resolve(users)
      })
      .catch((error) =>
        reject(`error inserting users ${error}`)
      )
  })
