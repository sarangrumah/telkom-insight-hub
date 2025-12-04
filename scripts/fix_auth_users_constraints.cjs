const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function fixConstraints() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Add Primary Key to auth.users if missing
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey' AND conrelid = 'auth.users'::regclass) THEN
            ALTER TABLE auth.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
            RAISE NOTICE 'Added users_pkey';
          ELSE
            RAISE NOTICE 'users_pkey already exists';
          END IF;
        END
        $$;
      `);
      console.log('Checked/Added users_pkey');
    } catch (e) {
      console.error('Error adding users_pkey:', e.message);
    }

    // 2. Add Unique Constraint on email if missing (partial index usually handles this but let's check if we need a constraint for other things, though usually PK is enough for FK)
    // The error "there is no unique constraint matching given keys for referenced table" specifically looks for a unique index on the referenced columns.
    // Since we are referencing 'id', the PK on 'id' should be sufficient.

  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

fixConstraints();