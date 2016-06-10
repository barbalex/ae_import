'use strict'
module.exports = (db) =>
  new Promise((resolve, reject) => {
    db.view('artendb/prov_objekte', {
      include_docs: true
    }, (error, res) => {
      if (error) {
        console.log('getObject.js, error', error)
        reject(`error getting objects: ${error}`)
      }
      const objects = res.map((doc) => doc)
      resolve(objects)
    })
  })
