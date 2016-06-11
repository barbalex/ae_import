'use strict'

const _ = require('lodash')
const uuid = require(`node-uuid`)

module.exports = (db, taxMoose, taxObjectsMooseLevel1, taxObjectsMooseLevel2) =>
  new Promise((resolve, reject) => {
    db.view('artendb/baumMoose', {
      group_level: 3
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsMooseLevel3 = _.map(keys, (key) => {
        const taxonomie = taxMoose._id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find((taxObj) =>
          taxObj.Name === klasseObjektName
        )
        const familieName = key[1]
        const familieObject = taxObjectsMooseLevel2.find((taxObj) =>
          taxObj.Name === familieName && taxObj.parent === klasseObject._id
        )
        const name = key[2]
        const parent = familieObject._id
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent
        }
      })
      db.save(taxObjectsMooseLevel3, (err, results) => {
        if (err) reject(`error saving taxObjectsMooseLevel3 ${err}`)
        // update taxObjectsMooseLevel3
        results.forEach((res, i) => {
          taxObjectsMooseLevel3[i]._rev = res.rev
        })
        resolve(taxObjectsMooseLevel3)
      })
    })
  })
