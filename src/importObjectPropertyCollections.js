'use strict'

const extractObjectCollectionsFromCouchObjects = require(`./extractObjectCollectionsFromCouchObjects.js`)

module.exports = (pgDb, couchObjects) =>
  new Promise((resolve, reject) => {
    let propertyCollections
    let relationCollections
    let objectPropertyCollections
    let objectRelationCollections
    let relations
    let relationPartners

    pgDb.any(`SELECT * FROM ae.property_collection`)
      .then((resultPC) => {
        propertyCollections = resultPC
        return pgDb.any(`Select * from ae.relation_collection`)
      })
      .then((resultRC) => {
        relationCollections = resultRC
        return pgDb.none(`truncate ae.object_property_collection cascade`)
      })
      .then(() => pgDb.none(`truncate ae.object_relation_collection cascade`))
      .then(() => pgDb.none(`truncate ae.relation cascade`))
      .then(() => pgDb.none(`truncate ae.relation_partner cascade`))
      .then(() =>
        extractObjectCollectionsFromCouchObjects(
          couchObjects,
          propertyCollections,
          relationCollections
        )
      )
      .then(({
        objectPropertyCollectionsToPass,
        objectRelationCollectionsToPass,
        relationsToPass,
        relationPartnersToPass
      }) => {
        objectPropertyCollections = objectPropertyCollectionsToPass
        objectRelationCollections = objectRelationCollectionsToPass
        relations = relationsToPass
        relationPartners = relationPartnersToPass
        // write objectPropertyCollections
        const valueSql = objectPropertyCollections
          .map((val) =>
            `('${val.object_id}','${val.property_collection_id}')`
          )
          .join(`,`)
        const sql = `
          insert into
            ae.object_property_collection (object_id,property_collection_id)
          values
            ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() =>
        Promise.all(objectPropertyCollections.map((val) => {
          const sql = `
            UPDATE
              ae.object_property_collection
            SET
              properties = $1
            WHERE
              object_id = $2
          `
          return pgDb.none(sql, [val.properties, val.object_id])
        }))
      )
      .then(() => {
        console.log(`${objectPropertyCollections.length} object property collections imported`)
        // write objectRelationCollections
        const valueSql = objectRelationCollections
          .map((val) =>
            `('${val.object_id}','${val.relation_collection_id}')`
          )
          .join(`,`)
        const sql = `
          insert into
            ae.object_relation_collection (object_id,relation_collection_id)
          values
            ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() => {
        console.log(`${objectRelationCollections.length} object relation collections imported`)
        // write relations
        const valueSql = relations
          .map((val) =>
            `('${val.id}','${val.object_id}','${val.relation_collection_id}')`
          )
          .join(`,`)
        const sql = `
          insert into
            ae.relation (id,object_id,relation_collection_id)
          values
            ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() =>
        Promise.all(relations.map((val) => {
          const sql = `
            UPDATE
              ae.relation
            SET
              properties = $1
            WHERE
              id = $2
          `
          return pgDb.none(sql, [val.properties, val.id])
        }))
      )
      .then(() => {
        console.log(`${relations.length} relations imported`)
        // write relationPartners
        const valueSql = relationPartners
          .map((val) =>
            `('${val.object_id}','${val.relation_id}')`
          )
          .join(`,`)
        const sql = `
          insert into
            ae.relation_partner (object_id,relation_id)
          values
            ${valueSql};`
        return pgDb.none(sql)
      })
      .then(() => {
        console.log(`${relationPartners.length} relationPartners imported`)
        console.log(`PostgreSQL wellcomes arteigenschaften.ch!`)
        resolve()
      })
      .catch((error) => reject(error))
  })
