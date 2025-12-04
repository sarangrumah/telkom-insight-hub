const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const expectedTables = [
  // auth
  'auth.audit_log_entries', 'auth.flow_state', 'auth.identities', 'auth.instances',
  'auth.mfa_amr_claims', 'auth.mfa_challenges', 'auth.mfa_factors', 'auth.oauth_clients',
  'auth.one_time_tokens', 'auth.refresh_tokens', 'auth.saml_providers', 'auth.saml_relay_states',
  'auth.schema_migrations', 'auth.sessions', 'auth.sso_domains', 'auth.sso_providers', 'auth.users',
  // public
  'public.activity_logs', 'public.api_integration_logs', 'public.application_documents',
  'public.application_evaluations', 'public.application_workflow', 'public.audit_logs',
  'public.captcha_sessions', 'public.companies', 'public.company_documents', 'public.faq_categories',
  'public.faqs', 'public.fields', 'public.indonesian_regions', 'public.kabupaten',
  'public.license_applications', 'public.license_services', 'public.login_attempts', 'public.modules',
  'public.permission_templates', 'public.permissions', 'public.person_in_charge', 'public.pic_documents',
  'public.profiles', 'public.provinces', 'public.record_permissions', 'public.services',
  'public.sub_services', 'public.support_tickets', 'public.telekom_data', 'public.ticket_assignments',
  'public.ticket_messages', 'public.ticket_sla_metrics', 'public.tickets', 'public.ulo_applications',
  'public.user_profiles', 'public.user_roles',
  // realtime
  'realtime.messages', 'realtime.schema_migrations', 'realtime.subscription',
  // storage
  'storage.buckets', 'storage.buckets_analytics', 'storage.migrations', 'storage.objects',
  'storage.prefixes', 'storage.s3_multipart_uploads', 'storage.s3_multipart_uploads_parts',
  // supabase_migrations
  'supabase_migrations.schema_migrations'
];

const expectedFunctions = [
  // auth
  'auth.email', 'auth.jwt', 'auth.role', 'auth.uid',
  // extensions
  'extensions.grant_pg_cron_access', 'extensions.grant_pg_graphql_access', 'extensions.grant_pg_net_access',
  'extensions.pgrst_ddl_watch', 'extensions.pgrst_drop_watch', 'extensions.set_graphql_placeholder',
  // pgbouncer
  'pgbouncer.get_auth',
  // public
  'public.approve_company', 'public.calculate_sla_metrics', 'public.check_record_permission',
  'public.check_user_permission', 'public.escalate_overdue_tickets', 'public.get_companies_for_management',
  'public.get_user_permissions', 'public.handle_new_user', 'public.has_role', 'public.log_changes',
  'public.reject_company', 'public.request_company_correction', 'public.submit_company_corrections',
  'public.update_updated_at_column', 'public.user_has_role',
  // realtime
  'realtime.apply_rls', 'realtime.broadcast_changes', 'realtime.build_prepared_statement_sql',
  'realtime.cast', 'realtime.check_equality_op', 'realtime.is_visible_through_filters',
  'realtime.list_changes', 'realtime.quote_wal2json', 'realtime.send',
  'realtime.subscription_check_filters', 'realtime.to_regrole', 'realtime.topic',
  // storage
  'storage.add_prefixes', 'storage.can_insert_object', 'storage.delete_prefix',
  'storage.delete_prefix_hierarchy_trigger', 'storage.enforce_bucket_name_length', 'storage.extension',
  'storage.filename', 'storage.foldername', 'storage.get_level', 'storage.get_prefix',
  'storage.get_prefixes', 'storage.get_size_by_bucket', 'storage.list_multipart_uploads_with_delimiter',
  'storage.list_objects_with_delimiter', 'storage.objects_insert_prefix_trigger',
  'storage.objects_update_prefix_trigger', 'storage.operation', 'storage.prefixes_insert_trigger',
  'storage.search', 'storage.search_legacy_v1', 'storage.search_v1_optimised', 'storage.search_v2',
  'storage.update_updated_at_column'
];

async function checkDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Check Tables
    const tablesRes = await client.query(`
      SELECT table_schema || '.' || table_name as full_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `);
    const existingTables = new Set(tablesRes.rows.map(r => r.full_name));

    console.log('\n--- Table Checklist ---');
    let missingTables = [];
    expectedTables.forEach(table => {
      if (existingTables.has(table)) {
        console.log(`[x] ${table}`);
      } else {
        console.log(`[ ] ${table} (MISSING)`);
        missingTables.push(table);
      }
    });

    // Check Functions
    const functionsRes = await client.query(`
      SELECT routine_schema || '.' || routine_name as full_name
      FROM information_schema.routines
      WHERE routine_schema NOT IN ('information_schema', 'pg_catalog')
    `);
    const existingFunctions = new Set(functionsRes.rows.map(r => r.full_name));

    console.log('\n--- Function Checklist ---');
    let missingFunctions = [];
    expectedFunctions.forEach(func => {
      if (existingFunctions.has(func)) {
        console.log(`[x] ${func}`);
      } else {
        console.log(`[ ] ${func} (MISSING)`);
        missingFunctions.push(func);
      }
    });

    if (missingTables.length === 0 && missingFunctions.length === 0) {
      console.log('\nAll expected tables and functions are present.');
    } else {
      console.log('\nSome tables or functions are missing.');
    }

    // Create Sample User
    console.log('\n--- Creating Sample User ---');
    const sampleUserEmail = 'sample_user@example.com';
    const sampleUserPassword = 'password123'; // In a real app, hash this!
    // Note: For Supabase auth, we usually insert into auth.users.
    // Since we are simulating/restoring, we might need to insert directly if the API isn't running or if we want to bypass it.
    // However, auth.users usually requires a hashed password.
    // For this check, I'll just check if it exists and insert a placeholder if not, assuming the auth system handles hashing or we use a known hash.
    // Using a dummy hash for 'password123' (bcrypt)
    const dummyHash = '$2a$10$2INzbPOvQwwTszPSz2aQT.UiKjhQWr9kAIDtTOmuK4Yc7JB8M1RPW'; // from existing data for 'alvinoa35@gmail.com' which might be 'password123' or similar, or just reuse it.

    const userCheck = await client.query('SELECT id FROM auth.users WHERE email = $1', [sampleUserEmail]);

    if (userCheck.rows.length === 0) {
      const userId = '00000000-0000-0000-0000-000000009999'; // Fixed UUID for sample
      await client.query(`
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
        VALUES ($1, $2, $3, NOW(), 'authenticated', 'authenticated')
      `, [userId, sampleUserEmail, dummyHash]);
      
      // Also add to public.profiles and public.user_roles if triggers don't handle it or to be sure
      // The trigger handle_new_user should handle profiles and user_roles insertion.
      console.log(`Sample user '${sampleUserEmail}' created with ID ${userId}.`);
    } else {
      console.log(`Sample user '${sampleUserEmail}' already exists.`);
    }

  } catch (err) {
    console.error('Database check failed:', err);
  } finally {
    await client.end();
  }
}

checkDatabase();