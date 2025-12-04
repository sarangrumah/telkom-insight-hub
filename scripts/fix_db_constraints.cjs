const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function fixConstraints() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Add Primary Key if missing
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_pkey') THEN
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
            RAISE NOTICE 'Added profiles_pkey';
          ELSE
            RAISE NOTICE 'profiles_pkey already exists';
          END IF;
        END
        $$;
      `);
      console.log('Checked/Added profiles_pkey');
    } catch (e) {
      console.error('Error adding profiles_pkey:', e.message);
    }

    // 2. Add Unique Constraint on user_id if missing
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key') THEN
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
            RAISE NOTICE 'Added profiles_user_id_key';
          ELSE
            RAISE NOTICE 'profiles_user_id_key already exists';
          END IF;
        END
        $$;
      `);
      console.log('Checked/Added profiles_user_id_key');
    } catch (e) {
      console.error('Error adding profiles_user_id_key:', e.message);
    }

    // 3. Add Foreign Key on user_id if missing
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey') THEN
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added profiles_user_id_fkey';
          ELSE
            RAISE NOTICE 'profiles_user_id_fkey already exists';
          END IF;
        END
        $$;
      `);
      console.log('Checked/Added profiles_user_id_fkey');
    } catch (e) {
      console.error('Error adding profiles_user_id_fkey:', e.message);
    }

  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

fixConstraints();