'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    insert into ae.organization (name)
    values ('a8e5bc98-696f-11e7-b453-3741aafa0388',FNS Kt. ZH');
  `)
  const organizations = await pgDb.many('select * from ae.organization')
  console.log('1 organization imported')

  return organizations
}
