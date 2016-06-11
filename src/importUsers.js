'use strict'

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    const sql = `insert into ae.user(name, email) values ('Alexander Gabriel', 'gabriel@gabriel-software.ch'), ('Andreas Lienhard', 'andreas.lienhard@bd.zh.ch');`  /* eslint quotes:0 */
    pgDb.none('truncate ae.user cascade')
      .then(() => pgDb.none(sql))
      .then(() => pgDb.many('select * from ae.user'))
      .then((users) => {
        console.log('users inserted')
        resolve(users)
      })
      .catch((error) =>
        reject(`error inserting users ${error}`)
      )
  })
