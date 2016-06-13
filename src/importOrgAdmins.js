'use strict'

module.exports = (pgDb, organizationId, users) =>
  new Promise((resolve, reject) => {
    const al = users.find((user) => user.email === `andreas.lienhard@bd.zh.ch`)
    const sql = `
    insert into
      ae.org_admin_writer (organization_id,user_id)
    values
      ('${organizationId}', '${al.id}');`
    pgDb.none(`truncate ae.org_admin_writer cascade`)
      .then(() => pgDb.none(sql))
      .then(() => pgDb.many(`select * from ae.org_admin_writer`))
      .then((orgAdminWriters) => {
        console.log(`1 org_admin_writer imported`)
        resolve(orgAdminWriters)
      })
      .catch((error) =>
        reject(`error inserting org_admin_writers ${error}`)
      )
  })
