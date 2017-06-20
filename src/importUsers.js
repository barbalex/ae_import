'use strict'

const hashPassword = require('./hashPassword.js')

module.exports = async pgDb => {
  await pgDb.none('truncate ae.user cascade')
  const hash = await hashPassword('secret')
  await pgDb.none(`
    insert into
      ae.user (name,email,password)
    values
      ('Alexander Gabriel', 'alex@gabriel-software.ch', '${hash}'),
      ('Andreas Lienhard', 'andreas.lienhard@bd.zh.ch', '${hash}');
  `)
  const users = await pgDb.many('select * from ae.user')
  console.log('2 users imported')

  return users
}
