'use strict'

const hashPassword = require('./hashPassword.js')

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    pgDb.none(`truncate ae.user cascade`)
      .then(() => hashPassword('secret'))
      .then((hash) => {
        const sql = `
        insert into
          ae.user (name,email,password)
        values
          ('Alexander Gabriel', 'alex@gabriel-software.ch', '${hash}'),
          ('Andreas Lienhard', 'andreas.lienhard@bd.zh.ch', '${hash}');`
        pgDb.none(sql)
      })
      .then(() => pgDb.many(`select * from ae.user`))
      .then((users) => {
        console.log(`2 users imported`)
        resolve(users)
      })
      .catch((error) =>
        reject(`error importing users ${error}`)
      )
  })
