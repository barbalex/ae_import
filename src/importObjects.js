'use strict'

const _ = require('lodash')

module.exports = async (pgDb, couchObjects, organizationId) => {
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

  await pgDb.none('truncate ae.object cascade')
  await pgDb.none(sql)
  console.log(`${couchObjects.length} objects imported`)

  return objects
}
