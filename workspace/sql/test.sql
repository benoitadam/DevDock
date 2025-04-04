\set QUIET on
\t
\a
SELECT 
  json_build_object(
    'tables', (
      SELECT json_agg(
        json_build_object(
          'table_name', table_name,
          'columns', (
            SELECT json_agg(
              json_build_object(
                'column_name', column_name,
                'data_type', data_type,
                'is_nullable', is_nullable
              )
            )
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = t.table_name
          )
        )
      )
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    )
  ) AS schema_json;