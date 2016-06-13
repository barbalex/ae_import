'use strict'

module.exports = (couchDb) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/ds_von_objekten`, {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view ds_von_objekten: ${error}`)
      resolve(result)
    })
  })
