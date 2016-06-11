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
  links text[] DEFAULT NULL,
  last_updated date DEFAULT NULL,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  group text DEFAULT NULL REFERENCES ae.group (name) ON UPDATE CASCADE,
  is_group_standard boolean DEFAULT FALSE
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/',''))=0)
);
CREATE INDEX ON ae.taxonomy USING btree (name);
CREATE INDEX ON ae.taxonomy USING btree (group);

DROP TABLE IF EXISTS ae.object CASCADE;
CREATE TABLE ae.object (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group text DEFAULT NULL REFERENCES ae.group (name) ON UPDATE CASCADE,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS ae.user CASCADE;
CREATE TABLE ae.user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

DROP TABLE IF EXISTS ae.tax_object CASCADE;
CREATE TABLE ae.tax_object (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_id UUID NOT NULL REFERENCES ae.taxonomy (id) ON DELETE CASCADE ON UPDATE CASCADE,
  object_id UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  parent_id UUID DEFAULT NULL REFERENCES ae.tax_object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text NOT NULL,
  object_properties jsonb DEFAULT NULL
);
CREATE INDEX ON ae.tax_object USING btree (name);

DROP TABLE IF EXISTS ae.property_collection CASCADE;
CREATE TABLE ae.property_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT NULL,
  links text[] DEFAULT NULL,
  number_of_records integer DEFAULT NULL,
  property_fields text[] DEFAULT NULL,
  combining boolean DEFAULT FALSE,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  last_updated date DEFAULT NULL,
  terms_of_use text DEFAULT NULL,
  "importedBy" UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/',''))=0)
);
CREATE INDEX ON ae.property_collection USING btree (name);

DROP TABLE IF EXISTS ae."relationCollection" CASCADE;
CREATE TABLE ae."relationCollection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT NULL,
  links text[] DEFAULT NULL,
  "natureOfRelation" text NOT NULL,
  number_of_records integer DEFAULT NULL,
  property_fields text[] DEFAULT NULL,
  combining boolean DEFAULT FALSE,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  last_updated date DEFAULT NULL,
  terms_of_use text DEFAULT NULL,
  "importedBy" UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/',''))=0)
);
CREATE INDEX ON ae."relationCollection" USING btree (name);

DROP TABLE IF EXISTS ae."objectPropertyCollection" CASCADE;
CREATE TABLE ae."objectPropertyCollection" (
  object_id UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "propertyCollectionId" UUID NOT NULL REFERENCES ae.property_collection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" jsonb DEFAULT NULL,
  PRIMARY KEY (object_id, "propertyCollectionId")
);

DROP TABLE IF EXISTS ae."objectRelationCollection" CASCADE;
CREATE TABLE ae."objectRelationCollection" (
  object_id UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationCollectionId" UUID NOT NULL REFERENCES ae."relationCollection" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, "relationCollectionId")
);

DROP TABLE IF EXISTS ae."relation" CASCADE;
CREATE TABLE ae."relation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationCollectionId" UUID NOT NULL REFERENCES ae."relationCollection" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" jsonb DEFAULT NULL,
  FOREIGN KEY (object_id, "relationCollectionId") REFERENCES ae."objectRelationCollection" (object_id, "relationCollectionId") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS ae."relationPartner";
CREATE TABLE ae."relationPartner" (
  object_id UUID NOT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "relationId" UUID NOT NULL REFERENCES ae.relation (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, "relationId")
);

DROP TABLE IF EXISTS ae."orgPropertyCollectionWriter";
CREATE TABLE ae."orgPropertyCollectionWriter" (
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" UUID NOT NULL REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (organization_id, "userId")
);

DROP TABLE IF EXISTS ae."orgHabitatWriter";
CREATE TABLE ae."orgHabitatWriter" (
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" UUID NOT NULL REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (organization_id, "userId")
);

DROP TABLE IF EXISTS ae."orgAdminWriter";
CREATE TABLE ae."orgAdminWriter" (
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" UUID NOT NULL REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (organization_id, "userId")
);
