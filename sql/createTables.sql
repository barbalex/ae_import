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
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  "group" text DEFAULT NULL,
  "isGroupStandard" boolean DEFAULT FALSE
);
CREATE INDEX ON ae.taxonomy USING btree ("name");

DROP TABLE IF EXISTS "taxObject";
CREATE TABLE ae."taxObject" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "taxonomyId" UUID NOT NULL REFERENCES ae.taxonomy (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  "parentId" UUID DEFAULT NULL REFERENCES ae."taxObject" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "name" text NOT NULL,
  "objectProperties" jsonb DEFAULT NULL
);

DROP TABLE IF EXISTS object;
CREATE TABLE ae.object (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group" text DEFAULT NULL REFERENCES ae.group (name) ON UPDATE CASCADE,
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "objectPropertyCollection";
CREATE TABLE ae."objectPropertyCollection" (
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "propertyCollectionId" UUID NOT NULL REFERENCES ae.propertyCollection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" jsonb DEFAULT NULL
);

DROP TABLE IF EXISTS "objectRelationCollection";
CREATE TABLE ae."objectRelationCollection" (
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationCollectionId" UUID NOT NULL REFERENCES ae.relationCollection (id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS relation;
CREATE TABLE ae.relation (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "objectRelationCollectionId" UUID NOT NULL REFERENCES ae.objectRelationCollection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" jsonb DEFAULT NULL
);

DROP TABLE IF EXISTS "relationPartner";
CREATE TABLE "relationPartner" (
  "objectId" UUID NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationId" UUID NOT NULL REFERENCES ae.relation (id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "propertyCollection";
CREATE TABLE "propertyCollection" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text DEFAULT NULL,
  "links" text[] DEFAULT NULL,
  "numberOfRecords" 
  "lastUpdated" date DEFAULT NULL,
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
);
