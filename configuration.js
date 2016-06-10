/**
 * Hier werden zentral alle Konfigurationsparameter gesammelt
 */

'use strict'

const config = {}
const pgPassfile = require('./pgDbPass.json')

config.db = {}
config.pg = {}
config.pg.userName = pgPassfile.user
config.pg.passWord = pgPassfile.pass
config.pg.connectionString = `postgres://${pgPassfile.user}:${pgPassfile.pass}@localhost:5432/ae`

module.exports = config
