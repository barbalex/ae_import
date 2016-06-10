'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = (db, taxFauna, taxObjectsFaunaLevel1) =>
  new Promise((resolve, reject) => {
    db.view('artendb/prov_baumFauna', {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFaunaLevel2 = _.map(keys, (key) => {
        const taxonomie = taxFauna._id
        const klasseName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) =>
          taxObj.Name === klasseName
        )
        const name = key[1]
        const parent = klasseObject._id
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent
        }
      })
      db.save(taxObjectsFaunaLevel2, (err, results) => {
        if (err) reject(`error saving taxObjectsFaunaLevel2 ${err}`)
        // update taxObjectsFaunaLevel2
        results.forEach((res, i) => {
          taxObjectsFaunaLevel2[i]._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel2)
      })
    })
  })
