import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:M%40ryadi86!@localhost:5432/telkom_hub'
});

async function executeBPSSchema() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Reading BPS schema file...');
    const schemaPath = path.join(process.cwd(), 'server', 'database', 'schema', 'bps_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing BPS schema...');
    await client.query('BEGIN');
    
    try {
      await client.query(schemaSQL);
      await client.query('COMMIT');
      console.log('✅ BPS schema executed successfully!');
    } catch (schemaError) {
      await client.query('ROLLBACK');
      console.error('❌ Error executing BPS schema:', schemaError.message);
      throw schemaError;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
executeBPSSchema();