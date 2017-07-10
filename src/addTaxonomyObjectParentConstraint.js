'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    ALTER TABLE ae.object ADD CONSTRAINT object_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE;
  `)
  console.log('object.parent_id constraint added')
}
