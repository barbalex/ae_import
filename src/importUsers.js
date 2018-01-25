'use strict'

const hashPassword = require('./hashPassword')

module.exports = async pgDb => {
  const hash = await hashPassword('secret')
  await pgDb.none(`
    insert into
      ae.user (id,name,email,role,pass)
    values
      ('a8eeeaa2-696f-11e7-b454-83e34acbe09f', 'Alexander Gabriel', 'alex@gabriel-software.ch', 'org_admin', '${hash}'),
      ('a8ef38f4-696f-11e7-b455-03a921a2ac8f', 'Andreas Lienhard', 'andreas.lienhard@bd.zh.ch', 'org_admin', '${hash}');
  `)
  const users = await pgDb.many('select * from ae.user')
  console.log('2 users imported')

  return users
}
