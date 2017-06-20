'use strict'

/* eslint camelcase:0 */

const uuidv1 = require('uuid/v1')
const _ = require('lodash')

module.exports = (objectsInCouch, pCsInPG, rCsInPG) => {
  const objectPropertyCollections = []
  const objectRelationCollections = []
  const relations = []
  const relationPartners = []

  const objectsInCouchIds = objectsInCouch.map(o => o._id)

  objectsInCouch.forEach(objectInCouch => {
    if (objectInCouch.Eigenschaftensammlungen) {
      const object_id = objectInCouch._id
      objectInCouch.Eigenschaftensammlungen.forEach(pCInCouch => {
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
          objectPropertyCollections.push({
            object_id,
            property_collection_id,
            properties,
          })
        } else {
          console.log(`Pc ${pCInCouch.Name} not added:`, { object_id, pCInPG })
        }
      })
    }

    if (objectInCouch.Beziehungssammlungen) {
      const object_id = objectInCouch._id
      objectInCouch.Beziehungssammlungen.forEach(rCInCouch => {
        // add relation_collection_object
        const rCInPG = rCsInPG.find(rc => rc.name === rCInCouch.Name)
        if (object_id && rCInPG && rCInPG.id) {
          const relation_collection_id = rCInPG.id
          objectRelationCollections.push({ object_id, relation_collection_id })

          // build relations
          if (rCInCouch.Beziehungen && rCInCouch.Beziehungen.length) {
            rCInCouch.Beziehungen.forEach(relationInCouch => {
              const id = uuidv1()
              const idsObjects = []
              let properties = null
              const propertiesInCouch = _.clone(relationInCouch)
              if (propertiesInCouch.Beziehungspartner) {
                delete propertiesInCouch.Beziehungspartner

                // build relation partner
                relationInCouch.Beziehungspartner.forEach(couchRelPartner => {
                  if (couchRelPartner.GUID) {
                    /**
                     * make sure every object is included at most
                     * once per relation
                     * and that an object exists for every guid
                     */
                    if (
                      !_.includes(idsObjects, couchRelPartner.GUID) &&
                      _.includes(objectsInCouchIds, couchRelPartner.GUID)
                    ) {
                      relationPartners.push({
                        object_id: couchRelPartner.GUID,
                        relation_id: id,
                      })
                      idsObjects.push(couchRelPartner.GUID)
                    }
                  }
                })
              }
              if (Object.keys(propertiesInCouch).length > 0) {
                properties = propertiesInCouch
              }
              if (idsObjects.length > 0) {
                // dont push any relations without partners
                relations.push({
                  id,
                  object_id,
                  relation_collection_id,
                  properties,
                })
              }
            })
          }
        } else {
          console.log(`Pc ${rCInCouch.Name} not added:`, {
            rCInPG,
            objectInCouch,
          })
        }
      })
    }
  })
  return {
    objectPropertyCollections,
    objectRelationCollections,
    relations,
    relationPartners,
  }
}
