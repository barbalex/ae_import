'use strict'

/* eslint-disable no-useless-escape */

module.exports = async pgDb => {
  await pgDb.none(`
    CREATE EXTENSION if not exists "uuid-ossp";
    CREATE EXTENSION if not exists pgcrypto;
    CREATE SCHEMA IF NOT EXISTS ae;
    CREATE SCHEMA IF NOT EXISTS auth; 
  `)
  console.log('extensions and schemas created')
}
