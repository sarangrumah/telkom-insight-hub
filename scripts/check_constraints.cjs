const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function checkConstraints() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND conrelid = 'public.profiles'::regclass
    `);

    console.log('Constraints on public.profiles:');
    res.rows.forEach(row => {
      console.log(`- ${row.conname}: ${row.pg_get_constraintdef}`);
    });

    const indexRes = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = 'profiles'
    `);
    console.log('\nIndexes on public.profiles:');
    indexRes.rows.forEach(row => {
        console.log(`- ${row.indexname}: ${row.indexdef}`);
    });

  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await client.end();
  }
}

checkConstraints();