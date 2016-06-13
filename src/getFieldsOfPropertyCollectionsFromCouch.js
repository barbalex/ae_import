'use strict'

const getFieldsOfPropertyCollectionFromCouch = require(`./getFieldsOfPropertyCollectionFromCouch.js`)

module.exports = (couchDb, cNames) =>
  new Promise((resolve, reject) => {
    const actions = cNames.map((cName) =>
      getFieldsOfPropertyCollectionFromCouch(couchDb, cName)
    )
    Promise.all(actions)
      .then((fieldsArray) => {
        const fieldsByCName = {}
        cNames.forEach((cName, index) => {
          fieldsByCName[cName] = fieldsArray[index]
        })
        resolve(fieldsByCName)
      })
      .catch((error) => reject(error))
  })
