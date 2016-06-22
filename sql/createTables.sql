DROP TABLE IF EXISTS ae.category CASCADE;
CREATE TABLE ae.category (
  name text PRIMARY KEY
);

DROP TABLE IF EXISTS ae.organization CASCADE;
CREATE TABLE ae.organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);
CREATE INDEX ON ae.organization USING btree (name);

DROP TABLE IF EXISTS ae.taxonomy CASCADE;
CREATE TABLE ae.taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT NULL,
  links text[] DEFAULT NULL,
  last_updated date DEFAULT NULL,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  category text DEFAULT NULL REFERENCES ae.category (name) ON UPDATE CASCADE,
  is_category_standard boolean DEFAULT FALSE,
  habitat_label varchar(50) DEFAULT NULL,
  habitat_comments text DEFAULT NULL,
  habitat_nr_fns_min integer DEFAULT NULL,
  habitat_nr_fns_max integer DEFAULT NULL
  CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)',''))=0)
);
CREATE INDEX ON ae.taxonomy USING btree (name);
CREATE INDEX ON ae.taxonomy USING btree (category);

DROP TABLE IF EXISTS ae.object CASCADE;
CREATE TABLE ae.object (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category text DEFAULT NULL REFERENCES ae.category (name) ON UPDATE CASCADE,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS ae.user CASCADE;
CREATE TABLE ae.user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

DROP TABLE IF EXISTS ae.taxonomy_object CASCADE;
CREATE TABLE ae.taxonomy_object (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_id UUID NOT NULL REFERENCES ae.taxonomy (id) ON DELETE CASCADE ON UPDATE CASCADE,
  object_id UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  parent_id UUID DEFAULT NULL REFERENCES ae.taxonomy_object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text NOT NULL,
  properties jsonb DEFAULT NULL
);
CREATE INDEX ON ae.taxonomy_object USING btree (name);

DROP TABLE IF EXISTS ae.property_collection CASCADE;
CREATE TABLE ae.property_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- later add UNIQUE
  name text NOT NULL,
  description text DEFAULT NULL,
  links text[] DEFAULT NULL,
  combining boolean DEFAULT FALSE,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  last_updated date DEFAULT NULL,
  terms_of_use text DEFAULT NULL,
  imported_by UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE
  --CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)',''))=0)
);
CREATE INDEX ON ae.property_collection USING btree (name);
ALTER TABLE ae.property_collection ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_collection_reader ON ae.property_collection;
CREATE POLICY
  property_collection_reader
  ON ae.property_collection
  FOR SELECT
  TO PUBLIC;
DROP POLICY IF EXISTS property_org_collection_writer ON ae.property_collection;
CREATE POLICY
  property_org_collection_writer
  ON ae.property_collection
  FOR ALL
  TO org_collection_writer, org_admin
  USING (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      WHERE
        ae.organization_user.organization_id = organization_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  )
  WITH CHECK (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      WHERE
        ae.organization_user.organization_id = organization_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  );


DROP TABLE IF EXISTS ae.relation_collection CASCADE;
CREATE TABLE ae.relation_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- later add UNIQUE
  name text NOT NULL,
  description text DEFAULT NULL,
  links text[] DEFAULT NULL,
  nature_of_relation text NOT NULL,
  combining boolean DEFAULT FALSE,
  organization_id UUID NOT NULL REFERENCES ae.organization (id) ON DELETE SET NULL ON UPDATE CASCADE,
  last_updated date DEFAULT NULL,
  terms_of_use text DEFAULT NULL,
  imported_by UUID NOT NULL REFERENCES ae.user (id) ON DELETE RESTRICT ON UPDATE CASCADE
  --CONSTRAINT proper_links CHECK (length(regexp_replace(array_to_string(links, ''),'((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)',''))=0)
);
CREATE INDEX ON ae.relation_collection USING btree (name);
ALTER TABLE ae.relation_collection ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS relation_collection_reader ON ae.relation_collection;
CREATE POLICY
  relation_collection_reader
  ON ae.relation_collection
  FOR SELECT
  TO PUBLIC;
DROP POLICY IF EXISTS relation_org_collection_writer ON ae.relation_collection;
CREATE POLICY
  relation_org_collection_writer
  ON ae.relation_collection
  FOR ALL
  TO org_collection_writer, org_admin
  USING (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      WHERE
        ae.organization_user.organization_id = organization_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  )
  WITH CHECK (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      WHERE
        ae.organization_user.organization_id = organization_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  );

DROP TABLE IF EXISTS ae.property_collection_object CASCADE;
CREATE TABLE ae.property_collection_object (
  object_id UUID REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  property_collection_id UUID REFERENCES ae.property_collection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  properties jsonb DEFAULT NULL,
  PRIMARY KEY (object_id, property_collection_id)
);
ALTER TABLE ae.property_collection_object ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_collection_object_reader ON ae.property_collection_object;
CREATE POLICY
  property_collection_object_reader
  ON ae.property_collection_object
  FOR SELECT
  TO PUBLIC;
DROP POLICY IF EXISTS property_org_collection_object_writer ON ae.property_collection_object;
CREATE POLICY
  property_org_collection_object_writer
  ON ae.property_collection_object
  FOR ALL
  TO org_collection_writer, org_admin
  USING (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      INNER JOIN
        (ae.property_collection
        INNER JOIN
          ae.property_collection_object
          ON property_collection_object.property_collection_id = ae.property_collection.id)
        ON ae.property_collection.organization_id = ae.organization_user.organization_id
      WHERE
        ae.property_collection_object.object_id = object_id AND
        ae.property_collection_object.property_collection_id = property_collection_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  )
  WITH CHECK (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      INNER JOIN
        (ae.property_collection
        INNER JOIN
          ae.property_collection_object
          ON property_collection_object.property_collection_id = ae.property_collection.id)
        ON ae.property_collection.organization_id = ae.organization_user.organization_id
      WHERE
        ae.property_collection_object.object_id = object_id AND
        ae.property_collection_object.property_collection_id = property_collection_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  );

DROP TABLE IF EXISTS ae.relation_collection_object CASCADE;
CREATE TABLE ae.relation_collection_object (
  object_id UUID REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  relation_collection_id UUID REFERENCES ae.relation_collection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, relation_collection_id)
);
ALTER TABLE ae.relation_collection_object ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS relation_collection_object_reader ON ae.relation_collection_object;
CREATE POLICY
  relation_collection_object_reader
  ON ae.relation_collection_object
  FOR SELECT
  TO PUBLIC;
DROP POLICY IF EXISTS relation_org_collection_object_writer ON ae.relation_collection_object;
CREATE POLICY
  relation_org_collection_object_writer
  ON ae.relation_collection_object
  FOR ALL
  TO org_collection_writer, org_admin
  USING (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      INNER JOIN
        (ae.relation_collection
        INNER JOIN
          ae.relation_collection_object
          ON relation_collection_object.relation_collection_id = ae.relation_collection.id)
        ON ae.relation_collection.organization_id = ae.organization_user.organization_id
      WHERE
        ae.relation_collection_object.object_id = object_id AND
        ae.relation_collection_object.relation_collection_id = relation_collection_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  )
  WITH CHECK (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      INNER JOIN
        (ae.relation_collection
        INNER JOIN
          ae.relation_collection_object
          ON relation_collection_object.relation_collection_id = ae.relation_collection.id)
        ON ae.relation_collection.organization_id = ae.organization_user.organization_id
      WHERE
        ae.relation_collection_object.object_id = object_id AND
        ae.relation_collection_object.relation_collection_id = relation_collection_id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  );

DROP TABLE IF EXISTS ae.relation CASCADE;
CREATE TABLE ae.relation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID DEFAULT NULL REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  relation_collection_id UUID NOT NULL REFERENCES ae.relation_collection (id) ON DELETE CASCADE ON UPDATE CASCADE,
  properties jsonb DEFAULT NULL,
  FOREIGN KEY (object_id, relation_collection_id) REFERENCES ae.relation_collection_object (object_id, relation_collection_id) ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE ae.relation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS relation_reader ON ae.relation;
CREATE POLICY
  relation_reader
  ON ae.relation
  FOR SELECT
  TO PUBLIC;
DROP POLICY IF EXISTS relation_org_writer ON ae.relation;
CREATE POLICY
  relation_org_writer
  ON ae.relation
  FOR ALL
  TO org_collection_writer, org_admin
  USING (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      INNER JOIN
        (ae.relation_collection
        INNER JOIN
          (ae.relation_collection_object
          INNER JOIN
            ae.relation
            ON ae.relation_collection_object.object_id = ae.relation.object_id AND
            ae.relation_collection_object.relation_collection_id = ae.relation.relation_collection_id)
          ON relation_collection_object.relation_collection_id = ae.relation_collection.id)
        ON ae.relation_collection.organization_id = ae.organization_user.organization_id
      WHERE
        ae.relation.id = id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  )
  WITH CHECK (
    current_user IN (
      SELECT
        cast(ae.organization_user.user_id as text)
      FROM
        ae.organization_user
      INNER JOIN
        (ae.relation_collection
        INNER JOIN
          (ae.relation_collection_object
          INNER JOIN
            ae.relation
            ON ae.relation_collection_object.object_id = ae.relation.object_id AND
            ae.relation_collection_object.relation_collection_id = ae.relation.relation_collection_id)
          ON relation_collection_object.relation_collection_id = ae.relation_collection.id)
        ON ae.relation_collection.organization_id = ae.organization_user.organization_id
      WHERE
        ae.relation.id = id AND
        ae.organization_user.role = 'orgCollectionWriter'
    )
  );


DROP TABLE IF EXISTS ae.relation_partner;
CREATE TABLE ae.relation_partner (
  object_id UUID REFERENCES ae.object (id) ON DELETE CASCADE ON UPDATE CASCADE,
  relation_id UUID REFERENCES ae.relation (id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (object_id, relation_id)
);

DROP TABLE IF EXISTS ae.role CASCADE;
CREATE TABLE ae.role (
  name text PRIMARY KEY
);

DROP TABLE IF EXISTS ae.organization_user;
CREATE TABLE ae.organization_user (
  organization_id UUID REFERENCES ae.organization (id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID REFERENCES ae.user (id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text REFERENCES ae.role (name) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (organization_id, user_id, role)
);

DROP TABLE IF EXISTS ae.org_property_collection_writer;
DROP TABLE IF EXISTS ae.org_habitat_writer;
DROP TABLE IF EXISTS ae.org_admin_writer;
