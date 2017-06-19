'use strict'

module.exports = pgDb =>
  pgDb
    .none('ALTER TABLE ae.property_collection ADD UNIQUE (name)')
    .then(() =>
      pgDb.none('ALTER TABLE ae.relation_collection ADD UNIQUE (name)')
    )
    .then(() => {
      console.log('unique constraints added to collection names')
    })
