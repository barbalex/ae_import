'use strict'

const uuid = require(`node-uuid`)

module.exports = (db, doc, index, lrTaxonomies) => {
  // this is lr > create Taxonomie-Objekt
  // first check needed fields
  if (!doc.Taxonomie.Eigenschaften.Parent) {
    return console.error('lr hat keinen Taxonomie.Eigenschaften.Parent', doc)
  } else if (!doc.Taxonomie.Eigenschaften.Parent.GUID) {
    return console.error('lr hat keinen Taxonomie.Eigenschaften.Parent.GUID', doc)
  } else if (!doc.Taxonomie.Name) {
    return console.error('lr hat keinen Taxonomie.Name', doc)
  }
  const taxonomie = lrTaxonomies.find((tax) =>
    tax.Name === doc.Taxonomie.Name
    )
  if (!taxonomie) {
    return console.error('für diese lr keine Taxonomie gefunden', doc)
  }
  const name = doc.Label ? `${doc.Label}: ${doc.Einheit}` : doc.Einheit
  const parentObject = doc.Taxonomie.Eigenschaften.Parent.GUID  // TODO: get this object's Taxonomie-Objekt!!
  const eigenschaften = doc.Taxonomie.Eigenschaften
  // remove Parent and Hierarchie
  if (eigenschaften.Parent) delete eigenschaften.Parent
  if (eigenschaften.Hierarchie) delete eigenschaften.Hierarchie
  const taxObj = {
    _id: uuid.v4(),
    Typ: 'Taxonomie-Objekt',
    Taxonomie: taxonomie._id,
    Name: name,
    Objekt: {
      id: doc._id,
      Eigenschaften: eigenschaften
    },
    parent: null,
    parentObject
  }
  // save this Taxonomie-Objekt
  db.save(taxObj, (error) => {
    if (error) console.error('error saving taxObj', taxObj)
    // console.log does not appear !?
    // if (index < 5) console.log(`lrTaxonomy-Object Nr. ${index}`, taxObj)
  })
}
