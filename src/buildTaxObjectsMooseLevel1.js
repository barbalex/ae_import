'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (db, taxMoose) =>
  new Promise((resolve, reject) => {
    db.view('artendb/baumMoose', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      const taxObjectsMooseLevel1 = names.map((name) => ({
        id: uuid.v4(),
        Taxonomie: taxMoose._id,
        name
      }))
      db.save(taxObjectsMooseLevel1, (err, results) => {
        if (err) reject(`error saving taxObjectsMooseLevel1 ${err}`)
        // update taxObjectsMooseLevel1
        results.forEach((res, i) => {
          taxObjectsMooseLevel1[i]._rev = res.rev
        })
        resolve(taxObjectsMooseLevel1)
      })
    })
  })
