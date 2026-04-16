import { query } from './server/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupTables() {
  try {
    console.log('🚀 Setting up database tables for Kominfo Tarif API sync...');
    
    // Create tariff_data table (for existing functionality)
    console.log('📊 Creating tariff_data table...');
    await query(`
      CREATE TABLE IF NOT EXISTS tariff_data (
        id SERIAL PRIMARY KEY,
        jenis_izin TEXT NOT NULL,
        title TEXT,
        color TEXT,
        title_jenis TEXT,
        penyelenggara TEXT,
        pic TEXT,
        email TEXT,
        status_email TEXT,
        id_user TEXT,
        app_name TEXT,
        id_jenis_izin TEXT,
        id_izin TEXT,
        id_jenis_report TEXT,
        jenis_periode TEXT,
        jenis TEXT,
        tanggal TEXT,
        filename TEXT,
        status TEXT DEFAULT 'Belum',
        tahun INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
        periode TEXT DEFAULT 'Bulanan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for tariff_data
    console.log('🔍 Creating indexes for tariff_data...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tariff_jenis_izin ON tariff_data(jenis_izin)',
      'CREATE INDEX IF NOT EXISTS idx_tariff_app_name ON tariff_data(app_name)',
      'CREATE INDEX IF NOT EXISTS idx_tariff_penyelenggara ON tariff_data(penyelenggara)',
      'CREATE INDEX IF NOT EXISTS idx_tariff_tahun ON tariff_data(tahun)',
      'CREATE INDEX IF NOT EXISTS idx_tariff_periode ON tariff_data(periode)',
      'CREATE INDEX IF NOT EXISTS idx_tariff_status ON tariff_data(status)',
      'CREATE INDEX IF NOT EXISTS idx_tariff_id_user ON tariff_data(id_user)',
      'CREATE INDEX IF NOT EXISTS idx_tariff_jenis ON tariff_data(jenis)'
    ];
    
    for (const index of indexes) {
      await query(index);
    }
    
    // Create kominfo_tarif_data table (for new sync functionality)
    console.log('🔄 Creating kominfo_tarif_data table...');
    await query(`
      CREATE TABLE IF NOT EXISTS kominfo_tarif_data (
        id SERIAL PRIMARY KEY,
        uid VARCHAR(255) UNIQUE,
        jenis_izin TEXT NOT NULL,
        title TEXT,
        color TEXT,
        title_jenis TEXT,
        penyelenggara TEXT,
        pic TEXT,
        email TEXT,
        status_email TEXT,
        id_user TEXT,
        app_name TEXT,
        id_jenis_izin TEXT,
        id_izin TEXT,
        id_jenis_report TEXT,
        jenis_periode TEXT,
        jenis TEXT,
        tanggal TEXT,
        filename TEXT,
        status TEXT DEFAULT 'Belum',
        tahun INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
        periode TEXT DEFAULT 'bulanan',
        api_status TEXT,
        api_jenis TEXT,
        last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        sync_error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create kominfo sync log table
    console.log('📝 Creating kominfo_sync_log table...');
    await query(`
      CREATE TABLE IF NOT EXISTS kominfo_sync_log (
        id SERIAL PRIMARY KEY,
        sync_type TEXT NOT NULL,
        status TEXT NOT NULL,
        total_records INTEGER DEFAULT 0,
        inserted_records INTEGER DEFAULT 0,
        updated_records INTEGER DEFAULT 0,
        error_records INTEGER DEFAULT 0,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        duration_seconds INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ All tables created successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - tariff_data: For existing tariff functionality');
    console.log('   - kominfo_tarif_data: For Kominfo API sync data');
    console.log('   - kominfo_sync_log: For sync activity tracking');
    console.log('');
    console.log('🚀 Ready to use Kominfo Tarif API synchronization!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up database tables:', error);
    process.exit(1);
  }
}

setupTables();