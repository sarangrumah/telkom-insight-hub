const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'telekom_hub_new.sql');
const outputFile = path.join(__dirname, '..', 'recreate_db.sql');

try {
  let sql = fs.readFileSync(inputFile, 'utf8');

  // 1. Add role creation if they don't exist (standard Supabase roles)
  const roleCreation = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_realtime_admin') THEN
    CREATE ROLE supabase_realtime_admin NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dashboard_user') THEN
    CREATE ROLE dashboard_user NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pgbouncer') THEN
    CREATE ROLE pgbouncer NOLOGIN;
  END IF;
END
$$;
`;

  // 2. Replace owners
  // We'll replace specific Supabase admin roles with 'postgres' for local compatibility
  // or keep them if we created the roles above.
  // However, usually for local dev, it's easier to just own everything by postgres.
  // Let's try to keep the roles but ensure they exist (step 1).
  
  // But `ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin` might fail if we are not superuser or that role.
  // Let's comment out ALTER DEFAULT PRIVILEGES for specific roles to avoid permission errors on restore
  // if the running user isn't superuser.
  
  // Actually, the safest bet for a "recreate script" for a standard postgres is to:
  // - Remove "ALTER SCHEMA ... OWNER TO ..." if it points to non-standard roles, or map them to postgres.
  // - Remove "ALTER TABLE ... OWNER TO ..."
  
  // Let's map all supabase_* roles to postgres for ownership to avoid issues.
  sql = sql.replace(/OWNER TO supabase_admin/g, 'OWNER TO postgres');
  sql = sql.replace(/OWNER TO supabase_auth_admin/g, 'OWNER TO postgres');
  sql = sql.replace(/OWNER TO supabase_storage_admin/g, 'OWNER TO postgres');
  sql = sql.replace(/OWNER TO supabase_realtime_admin/g, 'OWNER TO postgres');
  sql = sql.replace(/OWNER TO dashboard_user/g, 'OWNER TO postgres');
  
  // 3. Remove or comment out specific Supabase extensions that might not be available or needed locally
  // e.g. pg_graphql, pg_stat_statements (usually needs shared_preload_libraries)
  // We will wrap CREATE EXTENSION in IF NOT EXISTS (already there) but maybe comment out if known to cause issues.
  // For now, we'll leave them but be aware.
  
  // 4. Remove "SET session_replication_role = replica;" if present (not usually in pg_dump unless specified)
  
  // 5. Remove "CREATE PUBLICATION supabase_realtime" if it causes issues, but it's standard PG.
  
  // 6. Fix search_path in functions if they are hardcoded to something weird, but usually they are fine.
  
  // 7. Remove `\restrict` and `\unrestrict` commands which are pg_dump specific and might fail in some clients
  // although psql handles them.
  
  // Prepend the role creation
  const finalSql = roleCreation + '\n' + sql;

  fs.writeFileSync(outputFile, finalSql);
  console.log(`Successfully created ${outputFile}`);

} catch (err) {
  console.error('Error processing SQL dump:', err);
  process.exit(1);
}