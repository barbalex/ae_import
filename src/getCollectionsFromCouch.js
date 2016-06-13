'use strict'

module.exports = (couchDb) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/ds_bs_prov`, { group: true }, (error, result) => {
      if (error) return reject(`error querying view ds_bs_prov: ${error}`)
      if (!result) return resolve([], [])
      if (!result.rows) return resolve([], [])
      if (!result.rows.length) return resolve([], [])
      const cols = result.rows.map((row, index) => {
        const numberOfRecords = result.rows[index].value
        row.key.push(numberOfRecords)
        return row.key
      })
      const colsPC = cols.filter((c) => c[0] === `pC`)
      const colsRC = cols.filter((c) => c[0] === `rC`)
      resolve(colsPC, colsRC)
    })
  })
