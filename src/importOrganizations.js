'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    insert into ae.organization (name)
    values ('FNS Kt. ZH');
  `)
  const organizations = await pgDb.many('select * from ae.organization')
  console.log('1 organization imported')

  return organizations
}
