-- PostgreSQL-compatible schema for tariff_data table
-- This is the table that existing tarif.js route expects

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tariff_jenis_izin ON tariff_data(jenis_izin);
CREATE INDEX IF NOT EXISTS idx_tariff_app_name ON tariff_data(app_name);
CREATE INDEX IF NOT EXISTS idx_tariff_penyelenggara ON tariff_data(penyelenggara);
CREATE INDEX IF NOT EXISTS idx_tariff_tahun ON tariff_data(tahun);
CREATE INDEX IF NOT EXISTS idx_tariff_periode ON tariff_data(periode);
CREATE INDEX IF NOT EXISTS idx_tariff_status ON tariff_data(status);
CREATE INDEX IF NOT EXISTS idx_tariff_id_user ON tariff_data(id_user);
CREATE INDEX IF NOT EXISTS idx_tariff_jenis ON tariff_data(jenis);

-- Create trigger to update 'updated_at' column on every update
CREATE OR REPLACE FUNCTION update_tariff_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tariff_data_updated_at ON tariff_data;
CREATE TRIGGER update_tariff_data_updated_at
    BEFORE UPDATE ON tariff_data
    FOR EACH ROW
    EXECUTE FUNCTION update_tariff_data_updated_at();