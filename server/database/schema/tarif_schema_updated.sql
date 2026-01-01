-- Updated tariff_data table for PostgreSQL and Kominfo API integration
CREATE TABLE IF NOT EXISTS kominfo_tarif_data (
    id SERIAL PRIMARY KEY,
    -- API response fields
    uid VARCHAR(255) UNIQUE, -- Unique identifier from API
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
    -- Additional fields for sync tracking
    api_status TEXT, -- 'sudah' or 'belum'
    api_jenis TEXT, -- 'jasa' or 'jaringan'
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'error'
    sync_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_uid ON kominfo_tarif_data(uid);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_jenis_izin ON kominfo_tarif_data(jenis_izin);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_app_name ON kominfo_tarif_data(app_name);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_penyelenggara ON kominfo_tarif_data(penyelenggara);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_tahun ON kominfo_tarif_data(tahun);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_periode ON kominfo_tarif_data(periode);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_status ON kominfo_tarif_data(status);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_id_user ON kominfo_tarif_data(id_user);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_jenis ON kominfo_tarif_data(jenis);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_api_status ON kominfo_tarif_data(api_status);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_api_jenis ON kominfo_tarif_data(api_jenis);
CREATE INDEX IF NOT EXISTS idx_kominfo_tarif_sync_status ON kominfo_tarif_data(sync_status);

-- Create trigger to update 'updated_at' column on every update
CREATE OR REPLACE FUNCTION update_kominfo_tarif_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kominfo_tarif_updated_at
    BEFORE UPDATE ON kominfo_tarif_data
    FOR EACH ROW
    EXECUTE FUNCTION update_kominfo_tarif_updated_at();

-- Sync log table for tracking synchronization activities
CREATE TABLE IF NOT EXISTS kominfo_sync_log (
    id SERIAL PRIMARY KEY,
    sync_type TEXT NOT NULL, -- 'manual', 'scheduled'
    status TEXT NOT NULL, -- 'started', 'completed', 'failed'
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

CREATE INDEX IF NOT EXISTS idx_kominfo_sync_log_sync_type ON kominfo_sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_kominfo_sync_log_status ON kominfo_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_kominfo_sync_log_start_time ON kominfo_sync_log(start_time);