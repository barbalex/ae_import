'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = (db, taxFauna) =>
  new Promise((resolve, reject) => {
    db.view('artendb/baumFauna', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      const taxObjectsFaunaLevel1 = names.map((name) => ({
        _id: uuid.v4(),
        Typ: 'Taxonomie-Objekt',
        Taxonomie: taxFauna._id,
        Name: name
      }))
      db.save(taxObjectsFaunaLevel1, (err, results) => {
        if (err) reject(`error saving taxObjectsFaunaLevel1 ${err}`)
        // update taxObjectsFaunaLevel1
        results.forEach((res, i) => {
          taxObjectsFaunaLevel1[i]._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel1)
      })
    })
  })
