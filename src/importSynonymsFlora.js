'use strict'
/* eslint-disable camelcase */

const _ = require('lodash')

const floraSynonyms = require('./flora_synonyms')

module.exports = async pgDb => {
  const idList = await pgDb.many(`
    select ae.object.id, properties->'Taxonomie ID' as sisfnr from ae.object
    inner join ae.taxonomy on ae.taxonomy.id = ae.object.taxonomy_id
    where ae.taxonomy.name = 'SISF Index 2 (2005)' and properties->'Taxonomie ID' is not null;
  `)
  const synonyms1 = floraSynonyms
    .map(s => {
      const idListItem = idList.find(x => x.sisfnr === s.sisfnr)
      const object_id = idListItem ? idListItem.id : null
      const idListItemSynonym = idList.find(x => x.sisfnr === s.sisfnr_synonym)
      const object_id_synonym = idListItemSynonym ? idListItemSynonym.id : null
      if (object_id && object_id_synonym) {
        return {
          object_id,
          object_id_synonym,
        }
      }
      console.log('no id found for floraSynonyms:', s)
      return {}
    })
    .filter(x => x.object_id && x.object_id_synonym)
  const synonyms2 = floraSynonyms
    .map(s => {
      const id = idList.find(x => x.sisfnr === s.sisfnr_synonym)
      const idSynonym = idList.find(x => x.sisfnr === s.sisfnr)
      if (id && id.id && idSynonym && idSynonym.id) {
        return {
          object_id: id.id,
          object_id_synonym: idSynonym.id,
        }
      }
      console.log('no id found for floraSynonyms:', s)
      return {}
    })
    .filter(x => x.object_id && x.object_id_synonym)
  const synonyms = [...synonyms1, ...synonyms2]
  const fieldsSql = _.keys(synonyms[0]).join(',')
  const valueSql = synonyms
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.synonym (${fieldsSql})
    values ${valueSql};
  `)
  console.log(`${synonyms.length} flora synonyms imported`)
}
