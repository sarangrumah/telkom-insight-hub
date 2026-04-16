import { query } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeBPSSchema() {
  try {
    console.log('🔄 Executing BPS statistical data schema...');
    
    const bpsSchemaPath = path.join(__dirname, 'schema', 'bps_schema.sql');
    
    if (!fs.existsSync(bpsSchemaPath)) {
      throw new Error('bps_schema.sql file not found');
    }
    
    const sqlContent = fs.readFileSync(bpsSchemaPath, 'utf8');
    
    // Split SQL statements by semicolon and execute each
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await query(statement);
          successCount++;
        } catch (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          errorCount++;
          
          // Continue with other statements instead of failing completely
          if (error.message.includes('already exists')) {
            console.log('  → Table/function already exists, continuing...');
          }
        }
      }
    }
    
    console.log('\n📊 Execution Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📋 Total statements: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 BPS schema executed successfully!');
    } else {
      console.log('\n⚠️  BPS schema executed with some errors (likely due to existing objects)');
    }
    
    // Test a simple query to verify the schema
    try {
      console.log('\n🧪 Testing schema with a sample query...');
      const testResult = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'bps_%'
        ORDER BY table_name
      `);
      
      console.log('📋 Created BPS tables:');
      testResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
      
    } catch (testError) {
      console.log('⚠️  Could not verify created tables:', testError.message);
    }
    
  } catch (error) {
    console.error('❌ Fatal error executing BPS schema:', error);
    throw error;
  }
}

// Check if database connection is available
async function checkDatabaseConnection() {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure your database is running and credentials are correct in .env file');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 BPS Schema Executor');
  console.log('======================\n');
  
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    process.exit(1);
  }
  
  await executeBPSSchema();
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});