'use strict'

const { promisify } = require('util')

module.exports = async db => {
  const asyncCouchdbView = promisify(db.view)
  const objekte = await asyncCouchdbView('artendb/objekte', {
    include_docs: true,
  })
  // TODO: does this make sense????
  // should probably extract doc, right?
  const objects = objekte.map(doc => doc)
  return objects
}
