'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (db, taxMoose, taxObjectsMooseLevel1) =>
  new Promise((resolve, reject) => {
    db.view('artendb/baumMoose', {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsMooseLevel2 = _.map(keys, (key) => {
        const taxonomie = taxMoose._id
        const klasseName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find((taxObj) =>
          taxObj.name === klasseName
        )
        const name = key[1]
        const parent = klasseObject._id
        return {
          id: uuid.v4(),
          taxonomy_id: taxonomie,
          name,
          parent
        }
      })
      db.save(taxObjectsMooseLevel2, (err, results) => {
        if (err) reject(`error saving taxObjectsMooseLevel2 ${err}`)
        // update taxObjectsMooseLevel2
        results.forEach((res, i) => {
          taxObjectsMooseLevel2[i]._rev = res.rev
        })
        resolve(taxObjectsMooseLevel2)
      })
    })
  })
