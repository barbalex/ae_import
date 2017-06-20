'use strict'

module.exports = async asyncCouchdbView => {
  const objekte = await asyncCouchdbView('artendb/objekte', {
    include_docs: true,
  })

  return objekte.map(obj => obj.doc)
}
