'use strict'

const map = require('lodash/map')

module.exports = async asyncCouchdbView => {
  const objekte = await asyncCouchdbView('artendb/objekte', {
    include_docs: true,
  })
  const objekteExportieren = map(objekte, 'doc')

  return objekteExportieren
}
