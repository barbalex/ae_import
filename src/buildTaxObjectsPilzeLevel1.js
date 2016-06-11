'use strict'

const _ = require('lodash')
const uuid = require(`node-uuid`)

module.exports = (db, taxPilze) =>
  new Promise((resolve, reject) => {
    db.view('artendb/baumMacromycetes', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumMacromycetes: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      const taxObjectsPilzeLevel1 = names.map((name) =>
        ({
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxPilze._id,
          Name: name
        })
      )
      db.save(taxObjectsPilzeLevel1, (err, results) => {
        if (err) reject(`error saving taxObjectsPilzeLevel1 ${err}`)
        // update taxObjectsPilzeLevel1
        results.forEach((res, i) => {
          taxObjectsPilzeLevel1[i]._rev = res.rev
        })
        resolve(taxObjectsPilzeLevel1)
      })
    })
  })
