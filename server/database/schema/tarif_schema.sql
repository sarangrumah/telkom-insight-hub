-- Create tariff_data table
CREATE TABLE IF NOT EXISTS tariff_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    tahun INTEGER DEFAULT 2023,
    periode TEXT DEFAULT 'Bulanan',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tarif_jenis_izin ON tariff_data(jenis_izin);
CREATE INDEX IF NOT EXISTS idx_tarif_app_name ON tariff_data(app_name);
CREATE INDEX IF NOT EXISTS idx_tarif_penyelenggara ON tariff_data(penyelenggara);
CREATE INDEX IF NOT EXISTS idx_tarif_tahun ON tariff_data(tahun);
CREATE INDEX IF NOT EXISTS idx_tarif_periode ON tariff_data(periode);
CREATE INDEX IF NOT EXISTS idx_tarif_status ON tariff_data(status);
CREATE INDEX IF NOT EXISTS idx_tarif_id_user ON tariff_data(id_user);
CREATE INDEX IF NOT EXISTS idx_tarif_jenis ON tariff_data(jenis);

-- Create trigger to update 'updated_at' column on every update
CREATE TRIGGER IF NOT EXISTS update_tariff_data_updated_at
AFTER UPDATE ON tariff_data
FOR EACH ROW
BEGIN
    UPDATE tariff_data SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;