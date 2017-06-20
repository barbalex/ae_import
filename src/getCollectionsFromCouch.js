'use strict'

const get = require('lodash/get')

module.exports = async asyncCouchdbView => {
  const dsBsProv = await asyncCouchdbView('artendb/ds_bs_prov', { group: true })
  const rows = get(dsBsProv, 'rows', [])
  const cols = rows.map(row => row.key)
  const colsPC = cols.filter(c => c[0] === 'pC')
  const colsRC = cols.filter(c => c[0] === 'rC')

  return {
    colsPC,
    colsRC,
  }
}
