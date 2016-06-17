'use strict'

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    pgDb.none(`ALTER TABLE ae.property_collection ADD UNIQUE (name)`)
      .then(() => pgDb.none(`ALTER TABLE ae.relation_collection ADD UNIQUE (name)`))
      .then(() => {
        console.log(`unique constraints added to collection names`)
        resolve()
      })
      .catch((error) =>
        reject(`error adding unique constraints to collection names: ${error}`)
      )
  })
