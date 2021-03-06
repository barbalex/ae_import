'use strict'

const path = require('path')
const exec = require('child_process').exec
const pgDbPass = require('../pgDbPass.json')

module.exports = () =>
  new Promise((resolve, reject) => {
    const filename = path.join(
      __dirname,
      '../../ae2/src/sql/createFunctions.sql'
    )
    const cmd1 = `SETX PGPASSWORD ${pgDbPass.pass}`
    const cmd2 = `psql -U ${pgDbPass.user} -d ae -a -f ${filename}`
    exec(cmd1, error => {
      if (error) return reject(`error creating functions: ${error}`)
      exec(cmd2, error2 => {
        if (error2) return reject(`error creating functions: ${error2}`)
        console.log('functions created')
        resolve()
      })
    })
  })
