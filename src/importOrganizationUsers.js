'use strict'

module.exports = async (pgDb, organizationId) => {
  await pgDb.none(`
    insert into ae.organization_user (organization_id,user_id,role)
    values
      ('${organizationId}', 'a8eeeaa2-696f-11e7-b454-83e34acbe09f', 'orgHabitatWriter'),
      ('${organizationId}', 'a8eeeaa2-696f-11e7-b454-83e34acbe09f', 'orgCollectionWriter'),
      ('${organizationId}', 'a8eeeaa2-696f-11e7-b454-83e34acbe09f', 'orgAdmin'),
      ('${organizationId}', 'a8ef38f4-696f-11e7-b455-03a921a2ac8f', 'orgAdmin'),
      ('${organizationId}', 'a8ef38f4-696f-11e7-b455-03a921a2ac8f', 'orgHabitatWriter'),
      ('${organizationId}', 'a8ef38f4-696f-11e7-b455-03a921a2ac8f', 'orgCollectionWriter');
  `)
  console.log('6 organization_users imported')
}
