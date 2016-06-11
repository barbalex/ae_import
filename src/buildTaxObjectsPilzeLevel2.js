'use strict'

const _ = require('lodash')
const uuid = require(`node-uuid`)

module.exports = (db, taxPilze, taxObjectsPilzeLevel1, objects) =>
  new Promise((resolve, reject) => {
    db.view('artendb/baumMacromycetes', {
      group_level: 3
    }, (error, result) => {
      if (error) reject(`error querying view baumMacromycetes: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsPilzeLevel2 = _.map(keys, (key) => {
        const taxonomie = taxPilze._id
        const gattungName = key[0]
        const gattungObject = taxObjectsPilzeLevel1.find((taxObj) => taxObj.Name === gattungName)
        const name = key[1]
        const parent = gattungObject._id
        const objId = key[2]
        const object = objects.find((obj) => obj._id === objId)
        if (!object) console.log('no object found for objId', objId)
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          Objekt: {
            id: objId,
            Eigenschaften: eigenschaften
          },
          parent
        }
      })
      db.save(taxObjectsPilzeLevel2, (err, results) => {
        if (err) reject(`error saving taxObjectsPilzeLevel2 ${err}`)
        // update taxObjectsPilzeLevel2
        results.forEach((res, i) => {
          taxObjectsPilzeLevel2[i]._rev = res.rev
        })
        resolve(taxObjectsPilzeLevel2)
      })
    })
  })
