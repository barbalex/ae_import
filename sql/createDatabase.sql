CREATE DATABASE ae encoding 'UTF8';
CREATE SCHEMA ae;
-- CREATE EXTENSION pgcrypto;
CREATE EXTENSION "uuid-ossp";
CREATE ROLE org_collection_writer;
CREATE ROLE org_habitat_writer;
CREATE ROLE org_taxonomy_writer;
CREATE ROLE org_admin;
