'use strict'

const _ = require('lodash')

const mooseSynonyms = require('./moose_synonyms')

module.exports = async pgDb => {
  const idList = await pgDb.many(`
    select ae.taxonomy_object.id, properties->'Taxonomie ID' as sisfnr from ae.taxonomy_object
    inner join ae.taxonomy on ae.taxonomy.id = ae.taxonomy_object.taxonomy_id
    where ae.taxonomy.name = 'NISM (2010)' and properties->'Taxonomie ID' is not null;
  `)
  const synonyms1 = mooseSynonyms
    .map(s => {
      const id = idList.find(x => x.sisfnr === s.sisfnr)
      const idSynonym = idList.find(x => x.sisfnr === s.sisfnr_synonym)
      if (id && id.id && idSynonym && idSynonym.id) {
        return {
          taxonomy_object_id: id.id,
          taxonomy_object_id_synonym: idSynonym.id,
        }
      }
      console.log('no id found for mooseSynonyms:', s)
      return {}
    })
    .filter(x => x.taxonomy_object_id && x.taxonomy_object_id_synonym)
  const synonyms2 = mooseSynonyms
    .map(s => {
      const id = idList.find(x => x.sisfnr === s.sisfnr_synonym)
      const idSynonym = idList.find(x => x.sisfnr === s.sisfnr)
      if (id && id.id && idSynonym && idSynonym.id) {
        return {
          taxonomy_object_id: id.id,
          taxonomy_object_id_synonym: idSynonym.id,
        }
      }
      // there are about 35 non matching, where masterno is missing in taxonno
      return {}
    })
    .filter(x => x.taxonomy_object_id && x.taxonomy_object_id_synonym)
  const synonyms = [...synonyms1, ...synonyms2]
  const fieldsSql = _.keys(synonyms[0]).join(',')
  const valueSql = synonyms
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.synonym (${fieldsSql})
    values ${valueSql};
  `)
  console.log(`${synonyms.length} moose synonyms imported`)
}
