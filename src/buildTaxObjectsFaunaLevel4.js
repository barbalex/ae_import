'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = (
  db,
  taxFauna,
  taxObjectsFaunaLevel1,
  taxObjectsFaunaLevel2,
  taxObjectsFaunaLevel3,
  objects
) =>
  new Promise((resolve, reject) => {
    db.view('artendb/prov_baumFauna', {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsFaunaLevel4 = _.map(keys, (key) => {
        const taxonomie = taxFauna._id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) =>
          taxObj.Name === klasseObjektName
        )
        const ordnungObjektName = key[1]
        const ordnungObject = taxObjectsFaunaLevel2.find((taxObj) =>
          taxObj.Name === ordnungObjektName && taxObj.parent === klasseObject._id
        )
        const familieName = key[2]
        const familieObject = taxObjectsFaunaLevel3.find(
          (taxObj) => taxObj.Name === familieName && taxObj.parent === ordnungObject._id
        )
        const name = key[3]
        const parent = familieObject._id
        const objId = key[4]
        const object = objects.find((obj) => obj._id === objId)
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
      db.save(taxObjectsFaunaLevel4, (err, results) => {
        if (err) reject(`error saving taxObjectsFaunaLevel4 ${err}`)
        // update taxObjectsFaunaLevel4
        results.forEach((res, i) => {
          taxObjectsFaunaLevel4[i]._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel4)
      })
    })
  })
