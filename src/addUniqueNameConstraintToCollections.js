'use strict'

module.exports = async pgDb => {
  await pgDb.none('ALTER TABLE ae.property_collection ADD UNIQUE (name)')
  console.log('unique constraints added to collection names')
}
