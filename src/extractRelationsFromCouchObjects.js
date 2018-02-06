'use strict'

/* eslint camelcase:0 */

const uuidv1 = require('uuid/v1')
const isUuid = require('is-uuid')
const _ = require('lodash')

const pcFromRc = require('./pcFromRc')

module.exports = async (objectsInCouch, pgDb) => {
  let relations = []
  const existingPCs = await pgDb.any('SELECT * FROM ae.property_collection')

  const objectsInCouchIds = objectsInCouch.map(o => o._id.toLowerCase())

  objectsInCouch.forEach(objectInCouch => {
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
          if (
            object_id &&
            isUuid.anyNonNil(object_id) &&
            existingPcForRc &&
            existingPcForRc.id &&
            isUuid.anyNonNil(existingPcForRc.id)
          ) {
            const property_collection_id = existingPcForRc.id
            const relation_type = rCInPcFromRc.nature_of_relation
            // build relations
            if (rCInCouch.Beziehungen && rCInCouch.Beziehungen.length) {
              // eslint-disable-next-line prefer-arrow-callback, func-names
              rCInCouch.Beziehungen.forEach(function(relationInCouch) {
                let properties = null
                const propertiesInCouch = _.clone(relationInCouch)
                if (propertiesInCouch.Beziehungspartner) {
                  delete propertiesInCouch.Beziehungspartner

                  // build relation partner
                  relationInCouch.Beziehungspartner.forEach(couchRelPartner => {
                    if (couchRelPartner.GUID) {
                      const object_id_relation = couchRelPartner.GUID.toLowerCase()
                      // make sure that an object exists for every guid
                      if (_.includes(objectsInCouchIds, object_id_relation)) {
                        if (Object.keys(propertiesInCouch).length > 0) {
                          properties = propertiesInCouch
                        }
                        relations.push({
                          id: uuidv1(),
                          property_collection_id,
                          property_collection_of_origin_name:
                            rCInCouch.Ursprungsdatensammlung || null,
                          object_id,
                          object_id_relation,
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
      `${r.property_collection_id}${r.object_id}${r.object_id_relation}${
        r.relation_type
      }`
  )

  return relations
}
