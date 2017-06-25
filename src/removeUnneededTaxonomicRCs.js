'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    delete from ae.relation_collection
    where name in (
      'SISF Index 2 (2005): synonym',
      'SISF Index 2 (2005): gültige Namen',
      'NISM (2010): synonym',
      'NISM (2010): akzeptierte Referenz'
    );
  `)
  console.log('no more needed taxonomic relation collections removed')
}
