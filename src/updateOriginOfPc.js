'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    update ae.property_collection as x
    set pc_of_origin = y.id
    from ae.property_collection as y
    where
      y.name = x.pc_of_origin_name;
  `)
  await pgDb.none(`
    alter table ae.property_collection drop pc_of_origin_name;
  `)
  console.log(`converted origin_of_pc_name to origin_of_pc (id)`)
}
