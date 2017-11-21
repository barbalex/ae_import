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
    CREATE OR REPLACE FUNCTION ae.object_by_object_name(object_name text)
      RETURNS setof ae.object AS
      $$
        SELECT *
        FROM ae.object
        WHERE
          ae.object.name ilike ('%' || $1 || '%')
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.object_by_object_name(object_name text)
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.taxonomy_object_level1(taxonomy ae.taxonomy, taxonomy_id uuid)
      RETURNS setof ae.object AS
      $$
        SELECT to1.*
        FROM ae.object AS to1
          INNER JOIN ae.taxonomy
          ON ae.taxonomy.id = to1.taxonomy_id
        WHERE
          to1.parent_id IS NULL AND
          ae.taxonomy.id = to1.taxonomy_id AND
          1 = CASE
            WHEN $2 IS NULL THEN 1
            WHEN ae.taxonomy.id = $2 THEN 1
            ELSE 2
          END
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.taxonomy_object_level1(taxonomy ae.taxonomy, taxonomy_id uuid)
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
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.rco_properties_by_categories_function(categories text[])
    RETURNS setof ae.rco_properties_by_category AS
    $$
      WITH jsontypes AS (
        SELECT
          ae.property_collection.name AS property_collection_name,
          ae.relation.relation_type,
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
          INNER JOIN ae.relation
          ON ae.object.id = ae.relation.object_id
            INNER JOIN ae.property_collection
            ON ae.property_collection.id = ae.relation.property_collection_id,
          jsonb_each(ae.relation.properties) AS json_data
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
        relation_type,
        property_name,
        jsontype
      ORDER BY
        property_collection_name,
        relation_type,
        property_name,
        jsontype
    $$
    LANGUAGE sql STABLE;
    ALTER FUNCTION ae.rco_properties_by_categories_function(categories text[])
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.categories_of_taxonomies_function()
      RETURNS setof ae.categories_of_taxonomies AS
      $$
        WITH categoryTaxonomies AS (
          SELECT ae.category.name, ae.category.id, ae.taxonomy.id AS taxonomy_id
          FROM ae.taxonomy
            INNER JOIN ae.object
              INNER JOIN ae.category
              ON ae.category.name = ae.object.category
            ON ae.object.taxonomy_id = ae.taxonomy.id
          GROUP BY ae.category.name, ae.category.id, ae.taxonomy.id
        )
        SELECT name, id, count(*) AS count
        FROM categoryTaxonomies
        GROUP BY name, id
        ORDER BY name
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.categories_of_taxonomies_function()
      OWNER TO postgres;
  `)
  await pgDb.none(`
    CREATE OR REPLACE FUNCTION ae.taxonomies_of_category(category text)
      RETURNS setof ae.taxonomy AS
      $$
        SELECT DISTINCT ae.taxonomy.*
        FROM ae.taxonomy
          INNER JOIN ae.object
            INNER JOIN ae.category
            ON ae.category.name = ae.object.category
          ON ae.object.taxonomy_id = ae.taxonomy.id
        WHERE ae.category.name = $1
      $$
      LANGUAGE sql STABLE;
    ALTER FUNCTION ae.taxonomies_of_category(category text)
      OWNER TO postgres;
  `)
  console.log('functions added')
}