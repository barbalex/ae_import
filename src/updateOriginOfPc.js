'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    update ae.property_collection_object as x
    set property_collection_of_origin = y.id
    from ae.property_collection as y
    where
      y.name = x.property_collection_of_origin_name;
  `)
  await pgDb.none(`
    alter table ae.property_collection_object drop property_collection_of_origin_name;
  `)
  console.log(
    `converted property_collection_of_origin_name to property_collection_of_origin (id)`
  )
}
