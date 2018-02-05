'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    update ae.property_collection set pc_of_origin = pc2.id
    from ae.property_collection pc1
    inner join ae.property_collection pc2
    on pc1.pc_of_origin_name = pc2.name
    where pc1.pc_of_origin_name is not null;
  `)
  await pgDb.none(`
    alter table ae.property_collection drop pc_of_origin_name;
  `)
  console.log(`converted origin_of_pc_name to origin_of_pc`)
}
