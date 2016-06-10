'use strict'

const uuid = require('node-uuid')
const nonLrTaxonomies = require('./nonLrTaxonomies.js')

module.exports = (db) =>
  new Promise((resolve, reject) => {
    // generate id's
    nonLrTaxonomies.forEach((tax) => {
      tax._id = uuid.v4()
    })
    db.save(nonLrTaxonomies, (error, results) => {
      if (error) reject(`error saving nonLrTaxonomies: ${error}`)

      // update nonLrTaxonomies
      results.forEach((res, i) => {
        nonLrTaxonomies[i]._rev = res.rev
      })
      resolve(nonLrTaxonomies)
    })
  })
