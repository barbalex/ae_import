'use strict'

module.exports = async pgDb => {
  await pgDb.none(`
    insert into ae.organization (id,name,links,contact)
    values ('a8e5bc98-696f-11e7-b453-3741aafa0388','FNS Kt. ZH','{"http://www.naturschutz.zh.ch"}','a8ef38f4-696f-11e7-b455-03a921a2ac8f');
  `)
  console.log('1 organization imported')
  return
}
