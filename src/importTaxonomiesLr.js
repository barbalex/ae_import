'use strict'

const _ = require(`lodash`)
const replaceLineBreaks = require(`./replaceLineBreaks.js`)

module.exports = (couchDb, pgDb, organizationId) =>
  new Promise((resolve, reject) => {
    couchDb.view(`artendb/baumLr`, {
      startkey: [1],
      endkey: [1, `\u9999`, `\u9999`, `\u9999`, `\u9999`, `\u9999`],
      reduce: false,
      include_docs: true
    }, (error, result) => {
      if (error) reject(`error querying view baumLr: ${error}`)
      const taxonomies = result.rows.map((row) => {
        const doc = row.doc
        return {
          name: doc.Taxonomie.Eigenschaften.Taxonomie,
          habitat_label: doc.Taxonomie.Eigenschaften[`Einheit-Abkürzung`],
          description: doc.Taxonomie.Eigenschaften.Beschreibung,
          habitat_comments: replaceLineBreaks(doc.Taxonomie.Eigenschaften.Bemerkungen),
          habitat_nr_fns_min: doc.Taxonomie.Eigenschaften[`Einheit-Nrn FNS von`],
          habitat_nr_fns_max: doc.Taxonomie.Eigenschaften[`Einheit-Nrn FNS bis`],
          category: `Lebensräume`,
          is_category_standard: true,
          organization_id: organizationId
        }
      })
      const fieldsSql = _.keys(taxonomies[0]).join(`,`)
      const valueSql = taxonomies
        .map((tax) => `('${_.values(tax).join("','")}')`)  /* eslint quotes:0 */
        .join(`,`)
      const sql = `
      insert into
        ae.taxonomy (${fieldsSql})
      values
        ${valueSql};`
      pgDb.none(sql)
        .then(() => pgDb.many(`
          select
            *
          from
            ae.taxonomy
          where
            category='Lebensräume'`))
        .then((lrTaxonomies) => {
          console.log(`lr-taxonomies inserted`)
          resolve(lrTaxonomies)
        })
        .catch((err) =>
          reject(`error inserting lr-taxonomies ${err}`)
        )
    })
  })
