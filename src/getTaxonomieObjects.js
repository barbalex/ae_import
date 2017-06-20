'use strict'

const { promisify } = require('util')

module.exports = async db => {
  const asyncCouchdbView = promisify(db.view)
  const res = await asyncCouchdbView('artendb/taxonomy_objects', {
    include_docs: true,
  })
  const objects = res.map(doc => doc)
  return objects
}
