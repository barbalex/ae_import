'use strict'

/* eslint-disable no-useless-escape */

module.exports = async pgDb => {
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.category_by_data_type(datatype text)
      RETURNS setof ae.category AS
      $$
        SELECT ae.category.*
        FROM ae.category
        WHERE
          ae.category.data_type = $1
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.category_by_data_type(datatype text)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.category_taxonomy_by_category(category ae.category, categoryname text)
      RETURNS setof ae.taxonomy AS
      $$
        SELECT ae.taxonomy.*
        FROM ae.taxonomy
          INNER JOIN ae.category
          ON ae.category.name = ae.taxonomy.category
        WHERE
          ae.category.name = category_taxonomy_by_category.category.name AND
          1 = CASE
            WHEN $2 IS NULL THEN 1
            WHEN ae.category.name = $2 THEN 1
            ELSE 2
          END
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.category_taxonomy_by_category(category ae.category, categoryname text)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.property_collection_by_data_type(datatype text)
      RETURNS setof ae.property_collection AS
      $$
        SELECT ae.property_collection.*
        FROM ae.property_collection
        WHERE
          ae.property_collection.data_type = $1
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.property_collection_by_data_type(datatype text)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.property_collection_by_property_name(property_name text)
      RETURNS setof ae.property_collection AS
      $$
        SELECT *
        FROM ae.property_collection
        WHERE
          ae.property_collection.name ilike ('%' || $1 || '%')
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.property_collection_by_property_name(property_name text)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.taxonomy_object_by_taxonomy_object_name(taxonomy_object_name text)
      RETURNS setof ae.taxonomy_object AS
      $$
        SELECT *
        FROM ae.taxonomy_object
        WHERE
          ae.taxonomy_object.name ilike ('%' || $1 || '%')
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.taxonomy_object_by_taxonomy_object_name(taxonomy_object_name text)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.taxonomy_object_taxonomy_object(taxonomy_object ae.taxonomy_object, taxonomy_id Uuid)
      RETURNS setof ae.taxonomy_object AS
      $$
        SELECT to1.*
        FROM ae.taxonomy_object AS to1
          INNER JOIN ae.taxonomy_object AS to2
          ON to2.parent_id = to1.id
        WHERE
          to1.id = taxonomy_object_taxonomy_object.taxonomy_object.id AND
          1 = CASE
            WHEN $2 IS NULL THEN 1
            WHEN to1.id = $2 THEN 1
            ELSE 2
          END
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.taxonomy_object_taxonomy_object(taxonomy_object ae.taxonomy_object, taxonomy_id Uuid)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.taxonomy_taxonomy_object_level1(taxonomy ae.taxonomy, taxonomy_id uuid)
      RETURNS setof ae.taxonomy_object AS
      $$
        SELECT to1.*
        FROM ae.taxonomy_object AS to1
          INNER JOIN ae.taxonomy
          ON ae.taxonomy.id = to1.taxonomy_id
        WHERE
          to1.parent_id IS NULL AND
          ae.taxonomy.id = taxonomy_taxonomy_object_level1.taxonomy.id AND
          1 = CASE
            WHEN $2 IS NULL THEN 1
            WHEN ae.taxonomy.id = $2 THEN 1
            ELSE 2
          END
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.taxonomy_taxonomy_object_level1(taxonomy ae.taxonomy, taxonomy_id uuid)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.pco_properties_by_categories_function(categories text[])
    RETURNS setof ae.pco_properties_by_category AS
    $$
      WITH jsontypes AS (
        SELECT
          ae.property_collection.name AS property_collection_name,
          json_data.key AS property_name,
          CASE WHEN left(json_data.value::text,1) = '"'  THEN 'String'
            WHEN json_data.value::text ~ '^-?\d' THEN
            CASE WHEN json_data.value::text ~ '\.' THEN 'Number'
              ELSE 'Integer'
            END
            WHEN left(json_data.value::text,1) = '['  THEN 'Array'
            WHEN left(json_data.value::text,1) = '{'  THEN 'Object'
            WHEN json_data.value::text in ('true', 'false')  THEN 'Boolean'
            WHEN json_data.value::text = 'null'  THEN 'Null'
            ELSE 'unknown'
          END as jsontype
        FROM
          ae.object
          INNER JOIN ae.property_collection_object
          ON ae.object.id = ae.property_collection_object.object_id
            INNER JOIN ae.property_collection
            ON ae.property_collection.id = ae.property_collection_object.property_collection_id,
          jsonb_each(ae.property_collection_object.properties) AS json_data
        WHERE
          ae.object.category = ANY(categories)
      )
      SELECT
        *,
        count(*)
      FROM
        jsontypes
      GROUP BY
        property_collection_name,
        property_name,
        jsontype
      ORDER BY
        property_collection_name,
        property_name,
        jsontype
    $$
    LANGUAGE sql STABLE;
    ALTER FUNCTION ae.pco_properties_by_categories_function(categories text[])
      OWNER TO postgres;
  `)
  console.log('functions added')
}
