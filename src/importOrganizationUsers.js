'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    insert into ae.organization_user (organization_id,user_id,role)
    values
      ('a8e5bc98-696f-11e7-b453-3741aafa0388', 'a8eeeaa2-696f-11e7-b454-83e34acbe09f', 'orgAdmin'),
      ('a8e5bc98-696f-11e7-b453-3741aafa0388', 'a8ef38f4-696f-11e7-b455-03a921a2ac8f', 'orgAdmin');
  `)
  console.log('2 organization_users imported')
}
