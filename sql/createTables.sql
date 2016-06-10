DROP TABLE IF EXISTS group;
CREATE TABLE ae.group (
  "name" text PRIMARY KEY
);

DROP TABLE IF EXISTS taxonomy;
CREATE TABLE ae.taxonomy (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text DEFAULT NULL,
  "links" text[] DEFAULT NULL,
  "lastUpdated" date DEFAULT NULL,
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id),
  "group" text DEFAULT NULL,
  "isGroupStandard" boolean DEFAULT FALSE
);
CREATE INDEX ON ae.taxonomy USING btree ("name");

DROP TABLE IF EXISTS "taxObject";
CREATE TABLE ae."taxObject" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "taxonomyId" UUID NOT NULL REFERENCES ae.taxonomy (id),
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id),
  "parentId" UUID DEFAULT NULL REFERENCES ae."taxObject" (id),
  "name" text NOT NULL,
  "objectProperties" jsonb DEFAULT NULL
);

DROP TABLE IF EXISTS object;
CREATE TABLE ae.object (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group" text DEFAULT NULL REFERENCES ae.group (name),
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id)
);

DROP TABLE IF EXISTS "objectPropertyCollection";
CREATE TABLE ae."objectPropertyCollection" (
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id),
  "propertyCollectionId" UUID NOT NULL REFERENCES ae.propertyCollection (id),
  "properties" jsonb DEFAULT NULL
);