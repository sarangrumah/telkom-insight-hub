const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkConstraints() {
  try {
    await client.connect();
    console.log('Connected to database.');

    const res = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'auth.users'::regclass;
    `);

    console.log('Constraints on auth.users:');
    res.rows.forEach(row => {
      console.log(`- ${row.conname} (${row.contype}): ${row.def}`);
    });

    const indexes = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'users' AND schemaname = 'auth';
    `);
    console.log('\nIndexes on auth.users:');
    indexes.rows.forEach(row => {
        console.log(`- ${row.indexname}: ${row.indexdef}`);
    });

  } catch (err) {
    console.error('Error checking constraints:', err);
  } finally {
    await client.end();
  }
}

checkConstraints();