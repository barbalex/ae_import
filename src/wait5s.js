'use strict'

module.exports = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), 5000)
  })
