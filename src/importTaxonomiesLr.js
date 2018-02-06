'use strict'

/* eslint-disable max-len */

const _ = require('lodash')

module.exports = async (asyncCouchdbView, pgDb) => {
  const baumLr = await asyncCouchdbView('artendb/baumLr', {
    startkey: [1],
    endkey: [1, '\u9999', '\u9999', '\u9999', '\u9999', '\u9999'],
    reduce: false,
    include_docs: true,
  })
  const taxonomies = baumLr.rows.map(row => {
    const { doc } = row
    return {
      id: doc._id.toLowerCase(),
      type: 'Lebensraum',
      name: doc.Taxonomie.Eigenschaften.Taxonomie,
      habitat_label: doc.Taxonomie.Eigenschaften['Einheit-Abkürzung'],
      description: doc.Taxonomie.Eigenschaften.Beschreibung || null,
      habitat_comments: doc.Taxonomie.Eigenschaften.Bemerkungen || null,
      habitat_nr_fns_min: doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS von'],
      habitat_nr_fns_max: doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS bis'],
      organization_id: 'a8e5bc98-696f-11e7-b453-3741aafa0388',
      imported_by: 'a8eeeaa2-696f-11e7-b454-83e34acbe09f',
      terms_of_use:
        'Importiert mit Einverständnis des Autors. Eine allfällige Weiterverbreitung ist nur mit dessen Zustimmung möglich.',
    }
  })
  const fieldsSql = _.keys(taxonomies[0]).join(',')
  const valueSql = taxonomies
    .map(
      tax =>
        `('${_.values(tax)
          .join("','")
          .replace(/'',/g, 'null,')}')`
    )
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy (${fieldsSql})
    values ${valueSql};
  `)
  console.log(`${taxonomies.length} lr-taxonomies imported`)
}
