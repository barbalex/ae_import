'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    insert into auth.organization (name)
    values ('FNS Kt. ZH');
  `)
  const organizations = await pgDb.many('select * from auth.organization')
  console.log('1 organization imported')

  return organizations
}
