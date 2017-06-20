'use strict'

module.exports = async pgDb => {
  await pgDb.none('truncate ae.role cascade')
  await pgDb.none(`
    insert into ae.role (name)
    values
      ('orgAdmin'),
      ('orgHabitatWriter'),
      ('orgCollectionWriter');
  `)
  console.log('3 roles imported')
}
