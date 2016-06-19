'use strict'

const bcrypt = require('bcrypt')

module.exports = (password) =>
  new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) return reject(error)
      bcrypt.hash(password, salt, (error2, hash) => {
        if (error2) return reject(error2)
        resolve(hash)
      })
    })
  })
