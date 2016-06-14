'use strict'

/* eslint quotes:0 */

// const _ = require(`lodash`)

module.exports = (variable) => {
  // const searchString = `"`
  // const replaceString = ''
  if (typeof variable === `string` || variable instanceof String) {
    variable = variable
      .replace(`'`, '`')
      // .replace(`","`, ',')

    /*if (_.includes(variable, searchString)) {
      console.log(`variable before replacing`, variable)
      variable = variable.replace(searchString, replaceString)
      console.log(`variable after replacing`, variable)
    }*/
  }
  return variable
}
