'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    insert into ae.role (name)
    values
      ('orgAdmin'),
      ('orgTaxonomyWriter'),
      ('orgCollectionWriter');
  `)
  console.log('3 roles imported')
}
