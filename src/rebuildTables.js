'use strict'

const fs = require(`fs`)
const path = require(`path`)

module.exports = (pgDb) =>
  new Promise((resolve, reject) => {
    const filename = path.join(__dirname, `../sql/createTables.sql`)
    const queries = fs.readFileSync(filename).toString()
      .replace(/(\r\n|\n|\r)/gm, ` `) // remove newlines
      .replace(/\s+/g, ` `) // excess white space
      .split(`;`) // split into all statements
      .map(Function.prototype.call, String.prototype.trim)
      .filter((el) => el.length !== 0) // remove any empty ones

    Promise.all(queries.map((query) => pgDb.none(query)))
      .then(() => resolve())
      .catch((error) => reject(`error rebuilding tables: ${error}`))
  })
