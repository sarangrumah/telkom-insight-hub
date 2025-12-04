const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkRole() {
  try {
    await client.connect();
    console.log('Connected to database.');

    const email = 'superadmin@example.com';
    
    const userRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
        console.log('User not found');
        return;
    }
    const userId = userRes.rows[0].id;
    console.log(`User ID: ${userId}`);

    const roleRes = await client.query('SELECT role FROM public.user_roles WHERE user_id = $1', [userId]);
    console.log('Roles:', roleRes.rows);

    const profileRes = await client.query('SELECT is_validated FROM public.profiles WHERE user_id = $1', [userId]);
    console.log('Profile:', profileRes.rows[0]);

  } catch (err) {
    console.error('Error checking role:', err);
  } finally {
    await client.end();
  }
}

checkRole();