'use strict'

const _ = require(`lodash`)

module.exports = (couchDb, pgDb, couchObjects, organizationId) =>
  new Promise((resolve, reject) => {
    const objects = couchObjects.map((doc) => ({
      id: doc._id,
      category: doc.Gruppe === `Macromycetes` ? `Pilze` : doc.Gruppe,
      organization_id: organizationId
    }))
    const valueSql = objects
      .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
      .join(`,`)
    const sql = `
    insert into
      ae.object (id,category,organization_id)
    values
      ${valueSql};`
    pgDb.none(sql)
      .then(() => {
        console.log(`${couchObjects.length} objects imported`)
        resolve(objects)
      })
      .catch((err) =>
        reject(`error importing objects ${err}`)
      )
  })
