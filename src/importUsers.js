'use strict'

const hashPassword = require('./hashPassword')

module.exports = async pgDb => {
  const hash = await hashPassword('secret')
  await pgDb.none(`
    insert into
      auth.user (name,email,password)
    values
      ('Alexander Gabriel', 'alex@gabriel-software.ch', '${hash}'),
      ('Andreas Lienhard', 'andreas.lienhard@bd.zh.ch', '${hash}');
  `)
  const users = await pgDb.many('select * from auth.user')
  console.log('2 users imported')

  return users
}
