DROP TABLE IF EXISTS ae.group CASCADE;
CREATE TABLE ae.group (
  name text PRIMARY KEY
);

DROP TABLE IF EXISTS ae.organization CASCADE;
CREATE TABLE ae.organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);
CREATE INDEX ON ae.organization USING btree (name);

DROP TABLE IF EXISTS ae.taxonomy CASCADE;
CREATE TABLE ae.taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT NULL,
  "links" text[] DEFAULT NULL,
  "lastUpdated" date DEFAULT NULL,
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  "group" text DEFAULT NULL REFERENCES ae.group (name) ON UPDATE CASCADE,
  "isGroupStandard" boolean DEFAULT FALSE
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/',''))=0)
);
CREATE INDEX ON ae.taxonomy USING btree (name);
CREATE INDEX ON ae.taxonomy USING btree ("group");

DROP TABLE IF EXISTS ae."object" CASCADE;
CREATE TABLE ae."object" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group" text DEFAULT NULL REFERENCES ae.group (name) ON UPDATE CASCADE,
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS ae."user" CASCADE;
CREATE TABLE ae."user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

DROP TABLE IF EXISTS ae."taxObject" CASCADE;
CREATE TABLE ae."taxObject" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "taxonomyId" UUID NOT NULL REFERENCES ae.taxonomy (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  "parentId" UUID DEFAULT NULL REFERENCES ae."taxObject" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text NOT NULL,
  "objectProperties" jsonb DEFAULT NULL
);
CREATE INDEX ON ae."taxObject" USING btree (name);

DROP TABLE IF EXISTS ae."propertyCollection" CASCADE;
CREATE TABLE ae."propertyCollection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT NULL,
  "links" text[] DEFAULT NULL,
  "numberOfRecords" integer DEFAULT NULL,
  "propertyFields" text[] DEFAULT NULL,
  "combining" boolean DEFAULT FALSE,
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  "lastUpdated" date DEFAULT NULL,
  "termsOfUse" text DEFAULT NULL,
  "importedBy" UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/',''))=0)
);
CREATE INDEX ON ae."propertyCollection" USING btree (name);

DROP TABLE IF EXISTS ae."relationCollection" CASCADE;
CREATE TABLE ae."relationCollection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT NULL,
  "links" text[] DEFAULT NULL,
  "natureOfRelation" text NOT NULL,
  "numberOfRecords" integer DEFAULT NULL,
  "propertyFields" text[] DEFAULT NULL,
  "combining" boolean DEFAULT FALSE,
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  "lastUpdated" date DEFAULT NULL,
  "termsOfUse" text DEFAULT NULL,
  "importedBy" UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/',''))=0)
);
CREATE INDEX ON ae."relationCollection" USING btree (name);

DROP TABLE IF EXISTS ae."objectPropertyCollection" CASCADE;
CREATE TABLE ae."objectPropertyCollection" (
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "propertyCollectionId" UUID NOT NULL REFERENCES ae."propertyCollection" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" jsonb DEFAULT NULL,
  PRIMARY KEY ("objectId", "propertyCollectionId")
);

DROP TABLE IF EXISTS ae."objectRelationCollection" CASCADE;
CREATE TABLE ae."objectRelationCollection" (
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationCollectionId" UUID NOT NULL REFERENCES ae."relationCollection" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("objectId", "relationCollectionId")
);

DROP TABLE IF EXISTS ae."relation" CASCADE;
CREATE TABLE ae."relation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "objectId" UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationCollectionId" UUID NOT NULL REFERENCES ae."relationCollection" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" jsonb DEFAULT NULL,
  FOREIGN KEY ("objectId", "relationCollectionId") REFERENCES ae."objectRelationCollection" ("objectId", "relationCollectionId") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS ae."relationPartner";
CREATE TABLE ae."relationPartner" (
  "objectId" UUID NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationId" UUID NOT NULL REFERENCES ae.relation (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("objectId", "relationId")
);

DROP TABLE IF EXISTS ae."orgPropertyCollectionWriter";
CREATE TABLE ae."orgPropertyCollectionWriter" (
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" UUID NOT NULL REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("organizationId", "userId")
);

DROP TABLE IF EXISTS ae."orgHabitatWriter";
CREATE TABLE ae."orgHabitatWriter" (
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" UUID NOT NULL REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("organizationId", "userId")
);

DROP TABLE IF EXISTS ae."orgAdminWriter";
CREATE TABLE ae."orgAdminWriter" (
  "organizationId" UUID NOT NULL REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" UUID NOT NULL REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("organizationId", "userId")
);
