'use strict'

/**
 * TODO: correct property name part "Mitelland" to "Mittelland"
 */

module.exports = (pgDb, objects) => {
  new Promise((resolve, reject) => {
    const objectPropertyCollections = []
    const objectRelationCollections = []
    const relations = []
    const relationPartners = []

    pgDb.any(`
        SELECT
          *
        FROM
          ae.property_collection`
      )
        .then((data) => {
          propertyCollections = data
        })
        .catch((error) => reject(error))
    objects.forEach((object) => {
      const pCs = object.Eigenschaftensammlungen
      if (pCs) {
        pCs.forEach((pC) => {
          
        })
      }
      const rCs = object.Beziehungssammlungen
      if (rCs) {
        rCs.forEach((rc) => {
          
        })
      }
    })
  })
