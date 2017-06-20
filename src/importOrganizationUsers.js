'use strict'

module.exports = async (pgDb, organizationId, users) => {
  const ag = users.find(user => user.email === 'alex@gabriel-software.ch')
  const al = users.find(user => user.email === 'andreas.lienhard@bd.zh.ch')
  await pgDb.none('truncate ae.organization_user cascade')
  await pgDb.none(`
    insert into ae.organization_user (organization_id,user_id,role)
    values
      ('${organizationId}', '${ag.id}', 'orgHabitatWriter'),
      ('${organizationId}', '${ag.id}', 'orgCollectionWriter'),
      ('${organizationId}', '${ag.id}', 'orgAdmin'),
      ('${organizationId}', '${al.id}', 'orgAdmin'),
      ('${organizationId}', '${al.id}', 'orgHabitatWriter'),
      ('${organizationId}', '${al.id}', 'orgCollectionWriter');
  `)
  console.log('6 organization_users imported')
}
