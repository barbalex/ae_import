'use strict'

module.exports = (pgDb, organizationId, users) =>
  new Promise((resolve, reject) => {
    const ag = users.find((user) => user.email === `alex@gabriel-software.ch`)
    const sql = `
    insert into
      ae.org_habitat_writer (organization_id,user_id)
    values
      ('${organizationId}', '${ag.id}');`
    pgDb.none(`truncate ae.org_habitat_writer cascade`)
      .then(() => pgDb.none(sql))
      .then(() => pgDb.many(`select * from ae.org_habitat_writer`))
      .then((orgHabitatWriters) => {
        console.log(`1 org_habitat_writer imported`)
        resolve(orgHabitatWriters)
      })
      .catch((error) =>
        reject(`error importing org_habitat_writers ${error}`)
      )
  })
