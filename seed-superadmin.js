import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ─── Super Admin Credentials ───────────────────────────────────────────────
const SUPER_ADMIN_EMAIL    = 'superadmin@telkom-hub.id';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin@2026!';
const SUPER_ADMIN_NAME     = 'Super Administrator';
// ────────────────────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if already exists
    const { rows: existing } = await client.query(
      'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
      [SUPER_ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      const userId = existing[0].id;
      console.log(`User ${SUPER_ADMIN_EMAIL} already exists (id: ${userId}).`);

      // Ensure super_admin role exists
      const { rows: roleRows } = await client.query(
        "SELECT id FROM public.user_roles WHERE user_id = $1 AND role = 'super_admin' LIMIT 1",
        [userId]
      );
      if (roleRows.length === 0) {
        await client.query(
          "INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ($1, $2, 'super_admin', now())",
          [uuidv4(), userId]
        );
        console.log('Added super_admin role to existing user.');
      } else {
        console.log('super_admin role already assigned.');
      }

      // Reset password
      const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
      await client.query(
        'UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE id = $2',
        [hash, userId]
      );
      console.log('Password has been reset.');

      await client.query('COMMIT');
    } else {
      // Create new super admin
      const userId = uuidv4();
      const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

      await client.query(
        `INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, raw_user_meta_data)
         VALUES ($1, $2, $3, now(), now(), $4::jsonb)`,
        [userId, SUPER_ADMIN_EMAIL, hash, JSON.stringify({ full_name: SUPER_ADMIN_NAME })]
      );

      await client.query(
        `INSERT INTO public.profiles (user_id, full_name, is_validated, created_at, updated_at)
         VALUES ($1, $2, true, now(), now())
         ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_validated = true, updated_at = now()`,
        [userId, SUPER_ADMIN_NAME]
      );

      await client.query(
        "INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ($1, $2, 'super_admin', now())",
        [uuidv4(), userId]
      );

      await client.query('COMMIT');
      console.log('\n✅ Super Admin created successfully!');
      console.log(`   ID:       ${userId}`);
    }

    console.log('\n── Login Credentials ──────────────────────');
    console.log(`   Email:    ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('───────────────────────────────────────────\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed super admin:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
