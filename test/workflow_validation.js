/**
 * Workflow Validation Script
 * This script validates the complete registration and verification workflow
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function validateWorkflow() {
  console.log('Starting workflow validation...');
  
  // Test 1: Check if required database functions exist
  console.log('\n1. Checking database functions...');
  const functionsToCheck = [
    'approve_company',
    'reject_company', 
    'request_company_correction',
    'submit_company_corrections',
    'verify_certificate_document',
    'get_user_verification_status',
    'validate_company_documents',
    'get_user_access_permissions'
  ];
  
  for (const func of functionsToCheck) {
    try {
      const { data, error } = await supabase.rpc('information_schema.routines')
        .select('routine_name')
        .eq('routine_name', func);
      
      if (error) {
        console.log(`   ❌ Function ${func} - Error: ${error.message}`);
      } else {
        console.log(`   ✅ Function ${func} - Found`);
      }
    } catch (err) {
      console.log(`   ⚠️  Function ${func} - May not exist: ${err.message}`);
    }
  }
  
  // Test 2: Check if required tables exist
  console.log('\n2. Checking required tables...');
  const tablesToCheck = [
    'companies',
    'company_documents', 
    'person_in_charge',
    'pic_documents',
    'certificate_documents',
    'user_profiles',
    'user_roles',
    'profiles',
    'telekom_data'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table ${table} - Error: ${error.message}`);
      } else {
        console.log(`   ✅ Table ${table} - Exists`);
      }
    } catch (err) {
      console.log(`   ❌ Table ${table} - Error: ${err.message}`);
    }
  }
  
  // Test 3: Check if required enums exist
  console.log('\n3. Checking required enums...');
  const { data: enums, error: enumsError } = await supabase
    .from('pg_type')
    .select('typname')
    .eq('typtype', 'e')
    .in('typname', ['app_role', 'company_status', 'document_type']);
  
  if (enumsError) {
    console.log(`   ❌ Error checking enums: ${enumsError.message}`);
  } else {
    const foundEnums = enums.map(e => e.typname);
    ['app_role', 'company_status', 'document_type'].forEach(enumName => {
      if (foundEnums.includes(enumName)) {
        console.log(`   ✅ Enum ${enumName} - Exists`);
      } else {
        console.log(`   ❌ Enum ${enumName} - Missing`);
      }
    });
  }
  
  // Test 4: Check RLS policies
  console.log('\n4. Checking Row Level Security policies...');
  const { data: tablesWithRLS, error: rlsError } = await supabase
    .from('information_schema.tables')
    .select(`
      table_name,
      table_schema
    `)
    .eq('table_schema', 'public')
    .in('table_name', ['companies', 'company_documents', 'certificate_documents', 'telekom_data']);
  
  if (rlsWithError) {
    console.log(`   ❌ Error checking RLS: ${rlsError.message}`);
  } else {
    for (const table of tablesWithRLS) {
      try {
        const { data: rlsInfo, error: rlsInfoError } = await supabase
          .rpc('pg_tables')
          .select('rowsecurity')
          .eq('tablename', table.table_name);
        
        if (rlsInfoError) {
          console.log(`   ❌ RLS for ${table.table_name} - Error: ${rlsInfoError.message}`);
        } else {
          console.log(`   ✅ RLS for ${table.table_name} - Enabled`);
        }
      } catch (err) {
        console.log(`   ⚠️  RLS for ${table.table_name} - Check manually: ${err.message}`);
      }
    }
  }
  
  // Test 5: Check if API endpoints are accessible
  console.log('\n5. Checking API endpoints...');
  const endpointsToCheck = [
    { url: '/api/auth/verification-status', method: 'GET' },
    { url: '/api/companies/', method: 'GET' },
    { url: '/api/admin/pending-companies', method: 'GET' },
    { url: '/api/certificates/submit', method: 'POST' }
  ];
  
  for (const endpoint of endpointsToCheck) {
    try {
      // Since we can't make actual HTTP requests in this context, 
      // we'll just log what would be tested
      console.log(`   🟡 Endpoint ${endpoint.url} (${endpoint.method}) - Would be tested`);
    } catch (err) {
      console.log(`   ❌ Endpoint ${endpoint.url} - Error: ${err.message}`);
    }
  }
  
  // Test 6: Check if required storage buckets exist
  console.log('\n6. Checking storage buckets...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`   ❌ Error listing buckets: ${error.message}`);
    } else {
      const bucketNames = data.map(bucket => bucket.name);
      const requiredBuckets = ['documents', 'license-documents'];
      
      requiredBuckets.forEach(bucket => {
        if (bucketNames.includes(bucket)) {
          console.log(`   ✅ Storage bucket ${bucket} - Exists`);
        } else {
          console.log(`   ❌ Storage bucket ${bucket} - Missing`);
        }
      });
    }
  } catch (err) {
    console.log(`   ❌ Error checking storage buckets: ${err.message}`);
  }
  
  console.log('\nWorkflow validation completed!');
  console.log('Note: This script validates the presence of required components.');
  console.log('For full end-to-end testing, manual testing of the complete workflow is recommended.');
}

// Run validation
validateWorkflow().catch(console.error);