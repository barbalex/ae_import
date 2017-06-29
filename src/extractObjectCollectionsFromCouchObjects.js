'use strict'

/* eslint camelcase:0 */

const uuidv1 = require('uuid/v1')
const _ = require('lodash')

const pcFromRc = require('./pcFromRc')

module.exports = (objectsInCouch, pCsInPG) => {
  const objectPropertyCollections = []
  let relations = []

  const objectsInCouchIds = objectsInCouch.map(o => o._id)

  objectsInCouch.forEach(objectInCouch => {
    if (objectInCouch.Eigenschaftensammlungen) {
      const object_id = objectInCouch._id.toLowerCase()
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

    if (objectInCouch.Beziehungssammlungen) {
      const object_id = objectInCouch._id.toLowerCase()
      objectInCouch.Beziehungssammlungen.forEach(rCInCouch => {
        if (
          ![
            'SISF Index 2 (2005): synonym',
            'SISF Index 2 (2005): gültige Namen',
            'NISM (2010): synonym',
            'NISM (2010): akzeptierte Referenz',
          ].includes(rCInCouch.Name)
        ) {
          // add relation_collection_object
          // TODO:
          // use pcFromRc to find pc (=rcInPG)
          // const rCInPG = rCsInPG.find(rc => rc.name === rCInCouch.Name)
          const rCInPcFromRc = pcFromRc.find(
            x => x.nameBisher === rCInCouch.Name
          )
          if (!rCInPcFromRc) {
            // should not happen
            console.log('no pc found for rc in pcFromRc:', rCInCouch.Name)
          }
          const pcName = rCInPcFromRc.nameOfPcToAddTo || rCInPcFromRc.nameNew
          const pcForRcInPG = pCsInPG.find(pc => pc.name === pcName)
          if (!pcForRcInPG) {
            // should not happen
            console.log('no pc found for rc in pCsInPG:', rCInCouch.Name)
            console.log('no pc found for rc in pCsInPG, pcName:', pcName)
          }
          if (object_id && pcForRcInPG && pcForRcInPG.id) {
            // TODO: look of pco already exists
            // only create new one if not
            const existingPCO = objectPropertyCollections.find(
              pco =>
                pco.property_collection_id === pcForRcInPG.id &&
                pco.object_id === object_id
            )
            const propertyCollectionObjectId = existingPCO
              ? existingPCO.id
              : uuidv1()
            if (!existingPCO) {
              objectPropertyCollections.push({
                id: propertyCollectionObjectId,
                object_id,
                property_collection_id: pcForRcInPG.id,
                properties: null,
              })
            }
            const relation_type = rCInPcFromRc.nature_of_relation
            // build relations
            if (rCInCouch.Beziehungen && rCInCouch.Beziehungen.length) {
              rCInCouch.Beziehungen.forEach(relationInCouch => {
                let properties = null
                const propertiesInCouch = _.clone(relationInCouch)
                if (propertiesInCouch.Beziehungspartner) {
                  delete propertiesInCouch.Beziehungspartner

                  // build relation partner
                  relationInCouch.Beziehungspartner.forEach(couchRelPartner => {
                    if (couchRelPartner.GUID) {
                      // make sure that an object exists for every guid
                      if (_.includes(objectsInCouchIds, couchRelPartner.GUID)) {
                        if (Object.keys(propertiesInCouch).length > 0) {
                          properties = propertiesInCouch
                        }
                        relations.push({
                          id: uuidv1(),
                          property_collection_object_id: propertyCollectionObjectId,
                          related_object_id: couchRelPartner.GUID.toLocaleLowerCase(),
                          relation_type,
                          properties,
                        })
                      }
                    }
                  })
                }
              })
            }
          } else {
            console.log(`Pc ${rCInCouch.Name} not added:`, {
              pcForRcInPG,
              objectInCouch,
            })
          }
        }
      })
    }
  })
  relations = _.uniqBy(
    relations,
    r =>
      `${r.property_collection_object_id}${r.related_object_id}${r.relation_type}`
  )

  return {
    objectPropertyCollections,
    relations,
  }
}
