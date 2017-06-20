'use strict'

const _ = require('lodash')
const uuidv1 = require('uuid/v1')

module.exports = async (
  asyncCouchdbView,
  pgDb,
  taxMoose,
  taxObjectsMooseLevel1,
  taxObjectsMooseLevel2
) => {
  const baumMoose = asyncCouchdbView('artendb/baumMoose', {
    group_level: 3,
  })
  const keys = _.map(baumMoose, row => row.key)
  const taxObjectsMooseLevel3 = _.map(keys, key => {
    const taxonomie = taxMoose.id
    const klasseObjektName = key[0]
    const klasseObject = taxObjectsMooseLevel1.find(
      taxObj => taxObj.name === klasseObjektName
    )
    const familieName = key[1]
    const familieObject = taxObjectsMooseLevel2.find(
      taxObj =>
        taxObj.name === familieName && taxObj.parent_id === klasseObject.id
    )
    const name = key[2]
    return {
      id: uuidv1(),
      taxonomy_id: taxonomie,
      name,
      parent_id: familieObject.id,
    }
  })
  const fieldsSql = _.keys(taxObjectsMooseLevel3[0]).join(',')
  const valueSql = taxObjectsMooseLevel3
    .map(tax => `('${_.values(tax).join("','").replace(/'',/g, 'null,')}')`)
    .join(',')
  await pgDb.none(`
    insert into ae.taxonomy_object (${fieldsSql})
    values ${valueSql};
  `)

  return taxObjectsMooseLevel3
}
