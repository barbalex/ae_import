'use strict'

module.exports = (pgDb, organizationId, users) =>
  new Promise((resolve, reject) => {
    const ag = users.find((user) => user.email === `alex@gabriel-software.ch`)
    const al = users.find((user) => user.email === `andreas.lienhard@bd.zh.ch`)
    const sql = `
    insert into
      ae.organization_user (organization_id,user_id,role)
    values
      ('${organizationId}', '${ag.id}', 'orgHabitatWriter')
      ('${organizationId}', '${ag.id}', 'orgCollectionWriter'),
      ('${organizationId}', '${ag.id}', 'orgAdmin'),
      ('${organizationId}', '${al.id}', 'orgAdmin'),
      ('${organizationId}', '${al.id}', 'orgHabitatWriter'),
      ('${organizationId}', '${al.id}', 'orgCollectionWriter');`
    pgDb.none(`truncate ae.organization_user cascade`)
      .then(() => pgDb.none(sql))
      .then(() => {
        console.log(`6 organization_users imported`)
        resolve()
      })
      .catch((error) =>
        reject(`error importing organization_users: ${error}`)
      )
  })
