'use strict'

const _ = require(`lodash`)

module.exports = (couchDb, pcName) =>
  new Promise((resolve, reject) => {
    const pcNameSafe = pcName.replace(/&/g, '%26')
    couchDb.view(`artendb/ds_bs_guid`, {
      include_docs: true,
      limit: 1,
      startkey: `["${pcName}"]`,
      endkey: `["${pcName}", "\u9999"]`
    }, (error, result) => {
      if (error) return reject(`error querying view ds_bs_guid: ${error}`)
      const doc = _.get(result, `rows[0].doc`)
      if (!doc) return resolve([])
      if (!doc.Eigenschaftensammlungen) return resolve([])
      const pcs = doc.Eigenschaftensammlungen
      const pc = pcs.find((c) => c.Name && c.Name === pcName)
      if (!pc) return resolve([])
      if (!pc.Eigenschaften) return resolve([])
      const pcFields = _.keys(pc.Eigenschaften).sort()
      if (!pcFields) return resolve([])
      resolve(pcFields)
    })
  })
