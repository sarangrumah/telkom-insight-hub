const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const SUPERADMIN_EMAIL = 'superadmin@example.com';
const SUPERADMIN_PASSWORD = 'password123';
const SUPERADMIN_NAME = 'Super Admin';

async function createSuperAdmin() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // Check if user already exists
    const checkRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [SUPERADMIN_EMAIL]);
    
    let userId;

    if (checkRes.rows.length > 0) {
      console.log(`User ${SUPERADMIN_EMAIL} already exists. Updating role to super_admin...`);
      userId = checkRes.rows[0].id;
    } else {
      console.log(`Creating new superadmin user: ${SUPERADMIN_EMAIL}`);
      userId = uuidv4();
      const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
      
      await client.query('BEGIN');

      // Insert into auth.users
      await client.query(
        `INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, raw_user_meta_data)
         VALUES ($1, $2, $3, now(), now(), $4::jsonb)`,
        [
          userId,
          SUPERADMIN_EMAIL,
          hashedPassword,
          JSON.stringify({ full_name: SUPERADMIN_NAME, role: 'super_admin' }),
        ]
      );

      // Insert into public.profiles
      await client.query(
        `INSERT INTO public.profiles (id, user_id, full_name, is_validated, created_at, updated_at)
         VALUES ($1, $2, $3, true, now(), now())`,
        [uuidv4(), userId, SUPERADMIN_NAME]
      );

      await client.query('COMMIT');
      console.log('User created successfully.');
    }

    // Assign super_admin role
    // First, remove existing roles to be safe or just add if not exists. 
    // The app logic seems to enforce single role in some places but DB allows multiple.
    // Let's ensure they have super_admin role.
    
    const roleCheck = await client.query(
        'SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = $2',
        [userId, 'super_admin']
    );

    if (roleCheck.rows.length === 0) {
        await client.query(
            `INSERT INTO public.user_roles (id, user_id, role, created_at)
             VALUES ($1, $2, $3, now())`,
            [uuidv4(), userId, 'super_admin']
        );
        console.log('Assigned super_admin role.');
    } else {
        console.log('User already has super_admin role.');
    }

    console.log(`\nSuperadmin credentials:`);
    console.log(`Email: ${SUPERADMIN_EMAIL}`);
    console.log(`Password: ${SUPERADMIN_PASSWORD}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating superadmin:', err);
  } finally {
    await client.end();
  }
}

createSuperAdmin();