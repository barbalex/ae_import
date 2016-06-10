DROP TABLE IF EXISTS group;
CREATE TABLE ae.group (
  "name" text PRIMARY KEY
);

DROP TABLE IF EXISTS taxonomy;
CREATE TABLE ae.taxonomy (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text DEFAULT NULL,
  "description" text DEFAULT NULL,
  "links" text[] DEFAULT NULL,
  "lastUpdated" date DEFAULT NULL,
  "organisationId" UUID DEFAULT NULL,
  "groupId" text DEFAULT NULL,
  "isGroupStandard" boolean DEFAULT FALSE
);
CREATE INDEX ON ae.taxonomy USING btree ("name");