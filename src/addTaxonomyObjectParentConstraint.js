'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    ALTER TABLE ae.taxonomy_object ADD CONSTRAINT taxonomy_object_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES ae.taxonomy_object (id) ON DELETE CASCADE ON UPDATE CASCADE;
  `)
  console.log('taxonomy_object.parent_id constraint added to database')
}
