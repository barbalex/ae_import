'use strict'

const get = require('lodash/get')
const { promisify } = require('util')

module.exports = async couchDb => {
  const asyncCouchdbView = promisify(couchDb.view).bind(couchDb)
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
