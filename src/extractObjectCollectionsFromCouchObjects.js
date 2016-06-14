'use strict'
/* eslint camelcase:0 */

module.exports = (couchObjects, propertyCollections, relationCollections) => {
  const objectPropertyCollections = []
  const objectRelationCollections = []

  couchObjects.forEach((couchObject) => {
    if (couchObject.Eigenschaftensammlungen) {
      const object_id = couchObject._id
      couchObject.Eigenschaftensammlungen.forEach((couchPC) => {
        // add object_property_collection
        let pcNameToSearchFor = couchPC.Name
        if (couchPC.Name === `Schutz` && couchPC.Beschreibung === `Informationen zu 54 Lebensräumen`) {
          pcNameToSearchFor = `FNS Schutz (2009)`
        }
        const correspondingPC = propertyCollections.find((pc) => pc.name === pcNameToSearchFor)
        if (object_id && correspondingPC && correspondingPC.id) {
          const property_collection_id = correspondingPC.id
          let properties = null
          if (
            couchPC.Eigenschaften &&
            Object.keys(couchPC.Eigenschaften) &&
            Object.keys(couchPC.Eigenschaften).length > 0
          ) {
            properties = couchPC.Eigenschaften
            // replace typo in label
            Object.keys(properties).forEach((key) => {
              if (key.includes(`Mitelland`)) {
                const newKey = key.replace(`Mitelland`, `Mittelland`)
                properties[newKey] = properties[key]
                delete properties[key]
              }
            })
          }
          objectPropertyCollections.push({
            object_id,
            property_collection_id,
            properties
          })
        } else {
          console.log(`Pc ${couchPC.Name} not added:`, { object_id, correspondingPC })
        }
      })
    }
    if (couchObject.Beziehungssammlungen) {
      const object_id = couchObject._id
      couchObject.Beziehungssammlungen.forEach((couchRC) => {
        // add object_relation_collection
        const correspondingRC = relationCollections.find((rc) => rc.name === couchRC.Name)
        if (object_id && correspondingRC && correspondingRC.id) {
          const relation_collection_id = correspondingRC.id
          objectRelationCollections.push({ object_id, relation_collection_id })
        } else {
          console.log(`Pc ${couchRC.Name} not added:`, { correspondingRC, couchObject })
        }
      })
    }
  })
  return {
    objectPropertyCollectionsToPass: objectPropertyCollections,
    objectRelationCollectionsToPass: objectRelationCollections
  }
}
