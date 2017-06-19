'use strict'

const _ = require('lodash')

module.exports = (couchDb, pgDb, couchObjects, organizationId) => {
  const objects = couchObjects.map(doc => ({
    id: doc._id,
    category: doc.Gruppe === 'Macromycetes' ? 'Pilze' : doc.Gruppe,
    organization_id: organizationId,
  }))
  const valueSql = objects
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  const sql = `
    insert into
      ae.object (id,category,organization_id)
    values
      ${valueSql};`

  return pgDb
    .none('truncate ae.object cascade')
    .then(() => pgDb.none(sql))
    .then(() => {
      console.log(`${couchObjects.length} objects imported`)
      return objects
    })
}
