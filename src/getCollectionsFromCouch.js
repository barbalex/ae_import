'use strict'

const _ = require(`lodash`)

module.exports = (couchDb) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/ds_bs_prov`, { group_level: 3 }, (error, result) => {
      console.log(`result.rows`, result.rows)
      if (error) return reject(`error querying view ds_bs_prov: ${error}`)
      const collections = {
        pC: {},
        rC: {}
      }
      if (!result) return resolve(collections)
      if (!result.rows) return resolve(collections)
      if (!result.rows.length) return resolve(collections)
      result.rows.forEach((r) => {
        const cType = r.key[0]
        const cName = r.key[1]
        const props = r.key[2]
        const rows = r.value
        if (collections[cType][cName]) {
          collections[cType][cName].rows += rows
          collections[cType][cName].props = _.uniq(collections[cType][cName].props.concat(props))
        } else {
          collections[cType][cName] = { props, rows }
        }
      })
      console.log(`collections`, collections)
      resolve(collections)
    })
  })
