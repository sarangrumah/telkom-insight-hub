const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function setupModulesAndPermissions() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // Create modules if they don't exist
    const modules = [
      { code: 'dashboard', name: 'Dashboard', description: 'Dashboard access' },
      { code: 'data_management', name: 'Data Management', description: 'Data management operations' },
      { code: 'user_management', name: 'User Management', description: 'User management operations' },
    ];

    for (const module of modules) {
      const existing = await client.query(
        'SELECT id FROM public.modules WHERE code = $1',
        [module.code]
      );
      
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO public.modules (id, name, code, description, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, true, now(), now())`,
          [uuidv4(), module.name, module.code, module.description]
        );
        console.log(`Created module: ${module.name} (${module.code})`);
      } else {
        console.log(`Module already exists: ${module.name} (${module.code})`);
      }
    }

    // Get the module IDs
    const moduleIds = {};
    for (const module of modules) {
      const result = await client.query(
        'SELECT id FROM public.modules WHERE code = $1',
        [module.code]
      );
      moduleIds[module.code] = result.rows[0].id;
    }

    // Create default permissions for super_admin role
    const roles = ['super_admin', 'internal_admin'];
    const actions = ['create', 'read', 'update', 'delete'];

    for (const role of roles) {
      for (const [moduleCode, moduleId] of Object.entries(moduleIds)) {
        for (const action of actions) {
          const actionColumn = {
            create: 'can_create',
            read: 'can_read', 
            update: 'can_update',
            delete: 'can_delete'
          }[action];
          
          const existing = await client.query(
            `SELECT id FROM public.permissions 
             WHERE role = $1 AND module_id = $2 AND field_id IS NULL`,
            [role, moduleId]
          );
          
          if (existing.rows.length === 0) {
            await client.query(
              `INSERT INTO public.permissions 
               (id, role, module_id, field_id, ${actionColumn}, field_access, created_at, updated_at)
               VALUES ($1, $2, $3, NULL, $4, 'full', now(), now())`,
              [uuidv4(), role, moduleId, action === 'read'] // Only set read as true initially, we'll set all to true
            );
          } else {
            // Update existing permission
            await client.query(
              `UPDATE public.permissions 
               SET ${actionColumn} = true, updated_at = now()
               WHERE role = $1 AND module_id = $2 AND field_id IS NULL`,
              [role, moduleId]
            );
          }
        }
        console.log(`Set all permissions for role ${role} on module ${moduleCode}`);
      }
    }

    // Also make sure all actions are enabled for admin roles
    for (const role of roles) {
      for (const [moduleCode, moduleId] of Object.entries(moduleIds)) {
        await client.query(
          `UPDATE public.permissions 
           SET can_create = true, can_read = true, can_update = true, can_delete = true, updated_at = now()
           WHERE role = $1 AND module_id = $2 AND field_id IS NULL`,
          [role, moduleId]
        );
      }
    }

    console.log('\nModules and permissions setup completed successfully!');
    console.log('Super admin and internal admin now have full access to all modules.');
    
  } catch (err) {
    console.error('Error setting up modules and permissions:', err);
 } finally {
    await client.end();
  }
}

setupModulesAndPermissions();