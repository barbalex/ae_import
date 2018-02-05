'use strict'

/* eslint camelcase:0 */

const uuidv1 = require('uuid/v1')
const _ = require('lodash')

module.exports = async (objectsInCouch, pgDb) => {
  const propertyCollectionObjects = []
  const pCsInPG = await pgDb.any('SELECT * FROM ae.property_collection')

  objectsInCouch.forEach(objectInCouch => {
    if (objectInCouch.Eigenschaftensammlungen) {
      const object_id = objectInCouch._id.toLowerCase()
      // eslint-disable-next-line prefer-arrow-callback, func-names
      objectInCouch.Eigenschaftensammlungen.forEach(function(pCInCouch) {
        // add property_collection_object
        let pcNameToSearchFor = pCInCouch.Name
        if (
          pCInCouch.Name === 'Schutz' &&
          pCInCouch.Beschreibung === 'Informationen zu 54 Lebensräumen'
        ) {
          pcNameToSearchFor = 'FNS Schutz (2009)'
        }
        const pCInPG = pCsInPG.find(pc => pc.name === pcNameToSearchFor)
        if (pcNameToSearchFor && object_id && pCInPG && pCInPG.id) {
          const property_collection_id = pCInPG.id
          let properties = null
          if (
            pCInCouch.Eigenschaften &&
            Object.keys(pCInCouch.Eigenschaften) &&
            Object.keys(pCInCouch.Eigenschaften).length > 0
          ) {
            properties = _.clone(pCInCouch.Eigenschaften)
            // replace typo in label
            Object.keys(properties).forEach(key => {
              if (key.includes('Mitelland')) {
                const newKey = key.replace('Mitelland', 'Mittelland')
                properties[newKey] = properties[key]
                delete properties[key]
              }
            })
          }
          propertyCollectionObjects.push({
            id: uuidv1(),
            object_id,
            property_collection_id,
            properties,
          })
        } else {
          console.log(`Pc ${pCInCouch.Name} not added:`, { object_id, pCInPG })
        }
      })
    }
  })

  return propertyCollectionObjects
}
