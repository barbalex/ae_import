'use strict'

/* eslint camelcase:0 */

const uuidv1 = require('uuid/v1')
const _ = require('lodash')

const pcFromRc = require('./pcFromRc')

module.exports = async (objectsInCouch, pgDb) => {
  const propertyCollectionObjects = []
  let relations = []
  const existingPCs = await pgDb.any('SELECT * FROM ae.property_collection')
  const existingPCOs = await pgDb.any(
    'SELECT * FROM ae.property_collection_object'
  )

  const objectsInCouchIds = objectsInCouch.map(o => o._id)

  objectsInCouch.forEach(objectInCouch => {
    if (objectInCouch.Beziehungssammlungen) {
      const object_id = objectInCouch._id
      objectInCouch.Beziehungssammlungen.forEach(rCInCouch => {
        if (
          ![
            'SISF Index 2 (2005): synonym',
            'SISF Index 2 (2005): gültige Namen',
            'NISM (2010): synonym',
            'NISM (2010): akzeptierte Referenz',
          ].includes(rCInCouch.Name)
        ) {
          // add relation_collection_object if necessary
          const rCInPcFromRc = pcFromRc.find(
            x => x.nameBisher === rCInCouch.Name
          )
          if (!rCInPcFromRc) {
            // should not happen
            console.log('no pc found for rc in pcFromRc:', rCInCouch.Name)
          }
          const pcName = rCInPcFromRc.nameOfPcToAddTo || rCInPcFromRc.nameNew
          const existingPcForRc = existingPCs.find(pc => pc.name === pcName)
          if (!existingPcForRc) {
            // should not happen
            console.log('no pc found for rc in existingPCs:', rCInCouch.Name)
            console.log('no pc found for rc in existingPCs, pcName:', pcName)
          }
          if (object_id && existingPcForRc && existingPcForRc.id) {
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
                          property_collection_id: existingPcForRc.id,
                          object_id,
                          related_object_id: couchRelPartner.GUID,
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
              existingPcForRc,
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
    propertyCollectionObjects,
    relations,
  }
}
