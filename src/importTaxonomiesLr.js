'use strict'

/* eslint-disable max-len */

const _ = require('lodash')

module.exports = async (asyncCouchdbView, pgDb, organizationId, users) => {
  const baumLr = await asyncCouchdbView('artendb/baumLr', {
    startkey: [1],
    endkey: [1, '\u9999', '\u9999', '\u9999', '\u9999', '\u9999'],
    reduce: false,
    include_docs: true,
  })
  const taxonomies = baumLr.rows.map(row => {
    const { doc } = row
    return {
      id: doc._id,
      name: doc.Taxonomie.Eigenschaften.Taxonomie,
      habitat_label: doc.Taxonomie.Eigenschaften['Einheit-Abkürzung'],
      description: doc.Taxonomie.Eigenschaften.Beschreibung || null,
      habitat_comments: doc.Taxonomie.Eigenschaften.Bemerkungen || null,
      habitat_nr_fns_min: doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS von'],
      habitat_nr_fns_max: doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS bis'],
      category: 'Lebensräume',
      is_category_standard: true,
      organization_id: organizationId,
      imported_by:
        users.find(user => user.email === 'alex@gabriel-software.ch').id ||
        null,
      terms_of_use:
        'Importiert mit Einverständnis des Autors. Eine allfällige Weiterverbreitung ist nur mit dessen Zustimmung möglich.',
    }
  })
  const fieldsSql = _.keys(taxonomies[0]).join(',')
  const valueSql = taxonomies
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy (${fieldsSql})
    values ${valueSql};
  `)
  const lrTaxonomies = await pgDb.many(`
    select *
    from ae.taxonomy
    where category='Lebensräume'
  `)
  console.log(`${taxonomies.length} lr-taxonomies imported`)

  return lrTaxonomies
}
