CREATE DATABASE ae encoding 'UTF8';
CREATE SCHEMA ae;
CREATE EXTENSION "uuid-ossp";
DROP ROLE IF EXISTS org_collection_writer;
CREATE ROLE org_collection_writer;
DROP ROLE IF EXISTS org_habitat_writer;
CREATE ROLE org_habitat_writer;
DROP ROLE IF EXISTS org_taxonomy_writer;
CREATE ROLE org_taxonomy_writer;
DROP ROLE IF EXISTS org_admin;
CREATE ROLE org_admin;
