'use strict'

module.exports = (pgDb, organizationId, users) =>
  new Promise((resolve, reject) => {
    const ag = users.find((user) => user.email === `alex@gabriel-software.ch`)
    const sql = `
    insert into
      ae.org_property_collection_writer (organization_id,user_id)
    values
      ('${organizationId}', '${ag.id}');`
    pgDb.none(`truncate ae.org_property_collection_writer cascade`)
      .then(() => pgDb.none(sql))
      .then(() => pgDb.many(`select * from ae.org_property_collection_writer`))
      .then((orgPropertyCollectionWriters) => {
        console.log(`1 org_property_collection_writer imported`)
        resolve(orgPropertyCollectionWriters)
      })
      .catch((error) =>
        reject(`error inserting org_property_collection_writers ${error}`)
      )
  })
