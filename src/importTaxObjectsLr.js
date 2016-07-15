'use strict'

const _ = require(`lodash`)
const uuid = require(`node-uuid`)

module.exports = (couchDb, pgDb, taxLr, couchObjects) =>
  new Promise((resolve, reject) => {
    const lrObjects = couchObjects.filter((o) => o.Gruppe === 'Lebensräume')
    const taxObjectsLr = lrObjects.map((o) => {
      const label = _.get(o, 'Taxonomie.Eigenschaften.Label', null)
      const einheit = _.get(o, 'Taxonomie.Eigenschaften.Einheit', null)
      let name
      if (label && einheit) {
        name = `${label}: ${einheit}`
      } else if (label) {
        name = label
      } else if (einheit) {
        name = einheit
      }
      const parent_id = _.get(o, 'Taxonomie.Eigenschaften.Parent.GUID', null)  // eslint-disable-line camelcase
      const properties = _.clone(_.get(o, 'Taxonomie.Eigenschaften', null))
      if (properties.Taxonomie) delete properties.Taxonomie
      if (properties.Parent) delete properties.Parent
      if (properties.Hierarchie) delete properties.Hierarchie
      return {
        id: uuid.v4(),
        taxonomy_id: taxLr.id,
        parent_id,
        object_id: o._id,
        name,
        properties,
      }
    })
    const fieldsSql = _.keys(taxObjectsLr[0]).join(`,`)
    const valueSql = taxObjectsLr
      .map((tax) => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)  /* eslint quotes:0 */
      .join(`,`)
    const sql = `
    insert into
      ae.taxonomy_object (${fieldsSql})
    values
      ${valueSql};`
    pgDb.none(sql)
      .then(() => resolve(taxObjectsLr))
      .catch((err) =>
        reject(`error importing taxObjectsLr ${err}`)
      )
  })
