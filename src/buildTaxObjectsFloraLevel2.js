'use strict'

const _ = require('lodash')
const uuid = require(`node-uuid`)

module.exports = (db, taxFlora, taxObjectsFloraLevel1) =>
  new Promise((resolve, reject) => {
    db.view('artendb/baumFlora', {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumFlora: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFloraLevel2 = _.map(keys, (key) => {
        const taxonomie = taxFlora._id
        const familieName = key[0]
        const familieObject = taxObjectsFloraLevel1.find((taxObj) => taxObj.Name === familieName)
        const name = key[1]
        const parent = familieObject._id
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent
        }
      })
      db.save(taxObjectsFloraLevel2, (err, results) => {
        if (err) reject(`error saving taxObjectsFloraLevel2 ${err}`)
        // update taxObjectsFloraLevel2
        results.forEach((res, i) => {
          taxObjectsFloraLevel2[i]._rev = res.rev
        })
        resolve(taxObjectsFloraLevel2)
      })
    })
  })
