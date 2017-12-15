'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    insert into auth.role (name)
    values
      ('orgAdmin'),
      ('orgHabitatWriter'),
      ('orgCollectionWriter');
  `)
  console.log('3 roles imported')
}
