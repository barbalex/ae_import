'use strict'

module.exports = (value) => {
  if (value) {
    return value.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ')
  }
  return null
}
