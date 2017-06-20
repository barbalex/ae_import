'use strict'

module.exports = async asyncCouchdbView => {
  const objekte = await asyncCouchdbView('artendb/objekte', {
    include_docs: true,
  })
  // TODO: does this make sense????
  // should probably extract doc, right?
  const objects = objekte.map(doc => doc)
  return objects
}
