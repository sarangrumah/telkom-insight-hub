import { query } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSQLFile(sqlFile, description) {
  try {
    console.log(`Setting up ${description}...`);
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL statements by semicolon and execute each
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await query(statement);
      }
    }
    
    console.log(`✅ ${description} created successfully!`);
    
  } catch (error) {
    console.error(`❌ Error setting up ${description}:`, error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    // 1. Setup tariff data tables
    await executeSQLFile(
      path.join(__dirname, 'tariff_data_postgres.sql'),
      'tariff_data table'
    );
    
    // 2. Setup kominfo sync tables
    const kominfoSqlFile = path.join(__dirname, 'tarif_schema_updated.sql');
    if (fs.existsSync(kominfoSqlFile)) {
      await executeSQLFile(kominfoSqlFile, 'kominfo sync tables');
    }
    
    // 3. Setup BPS statistical data tables
    await executeSQLFile(
      path.join(__dirname, 'bps_schema.sql'),
      'BPS statistical data tables'
    );
    
    console.log('🎉 All database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();