'use strict'

const groups = require('./groups.json')

module.exports = (db) =>
  new Promise((resolve, reject) => {
    db.save(groups, (error) => {
      if (error) reject(`error saving groups: ${error}`)
      // update nonLrTaxonomies
      console.log('Groups built')
      resolve(true)
    })
  })
