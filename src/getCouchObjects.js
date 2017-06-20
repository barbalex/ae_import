'use strict'

module.exports = async asyncCouchdbView => {
  const objekte = await asyncCouchdbView('artendb/objekte', {
    include_docs: true,
  })
  // TODO: does this make sense????
  // should probably extract doc, right?
  console.log('getCouchObjects: objekte[0]:', objekte[0])
  const objects = objekte.map(doc => doc)
  console.log('getCouchObjects: objects[0]:', objects[0])
  return objects
}
