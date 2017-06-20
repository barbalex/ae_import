'use strict'

const bcrypt = require('bcrypt')
const { promisify } = require('util')

const asyncGenSalt = promisify(bcrypt.genSalt)
const asyncHash = promisify(bcrypt.hash)

module.exports = async password => {
  const salt = await asyncGenSalt(10)
  const hash = await asyncHash(password, salt)

  return hash
}
