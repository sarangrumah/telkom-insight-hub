import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:M%40ryadi86!@localhost:5432/telkom_hub'
});

async function checkTableStructure() {
  try {
    const client = await pool.connect();
    
    console.log('Checking bps_monitored_areas table structure...');
    
    // Check if the table exists and what columns it has
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'bps_monitored_areas'
      ORDER BY ordinal_position
    `);
    
    console.log('bps_monitored_areas columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    client.release();
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();