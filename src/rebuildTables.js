'use strict'

const path = require('path')
const exec = require('child_process').exec
const pgDbPass = require('../pgDbPass.json')

module.exports = () =>
  new Promise((resolve, reject) => {
    const filename = path.join(__dirname, '../sql/createTables.sql')
    const cmd1 = `set PGPASSWORD="${pgDbPass.pass}"`
    const cmd2 = `psql -U postgres -d ae -a -f ${filename}`
    exec(cmd1, error => {
      if (error) return reject(`error rebuilding tables: ${error}`)
      exec(cmd2, error2 => {
        if (error2) return reject(`error rebuilding tables: ${error2}`)
        console.log('database structure rebuilt')
        resolve()
      })
    })
  })
