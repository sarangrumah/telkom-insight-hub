const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testPermissions() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // Check if modules exist
    const modules = await client.query('SELECT * FROM public.modules');
    console.log('Modules count:', modules.rows.length);
    console.log('Modules:', modules.rows);

    // Check if permissions exist
    const permissions = await client.query('SELECT * FROM public.permissions');
    console.log('Permissions count:', permissions.rows.length);
    console.log('Permissions:', permissions.rows);

    // Check if superadmin user exists and has role
    const superadmin = await client.query('SELECT id, email FROM auth.users WHERE email = $1', ['superadmin@example.com']);
    if (superadmin.rows.length > 0) {
      const userId = superadmin.rows[0].id;
      console.log('Superadmin user ID:', userId);
      
      const roles = await client.query('SELECT role FROM public.user_roles WHERE user_id = $1', [userId]);
      console.log('Superadmin roles:', roles.rows);
      
      // Test the isAdminRoleList logic
      const isAdmin = roles.rows.some(r => r.role === 'super_admin' || r.role === 'internal_admin');
      console.log('Is admin (superadmin/internal_admin):', isAdmin);
    }

    // Test what the requirePermission function would check for dashboard/data_management
    // This is what happens inside requirePermission when checking ['dashboard','data_management'] for read access
    const testQuery = `
      SELECT 1
        FROM public.permissions p
        LEFT JOIN public.modules m ON m.id = p.module_id
       WHERE ((m.code = $1 AND p.can_read = true) OR (m.code = $2 AND p.can_read = true))
         AND p.role IN (SELECT role FROM public.user_roles WHERE user_id = $3)
       LIMIT 1`;
    
    // We'll use a dummy user ID to simulate the query (it won't find any permissions since modules don't exist)
    // But this shows what the function is looking for
    console.log('\nTesting permission query structure...');
    console.log('The requirePermission function looks for permissions in the database that match:');
    console.log('- Module code in [\'dashboard\', \'data_management\']');
    console.log('- Action = read (can_read = true)');
    console.log('- Role that matches user\'s roles');
    console.log('Since no modules/permissions exist, it will return no rows and send 403');

  } catch (err) {
    console.error('Error testing permissions:', err);
 } finally {
    await client.end();
 }
}

testPermissions();