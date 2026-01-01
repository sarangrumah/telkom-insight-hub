-- BPS Statistical Data Schema
-- Time-series optimized for Indonesian statistical data from BPS Web API v1
-- Uses existing public.provinces and public.kabupaten tables for area management

-- =============================================================================
-- CONFIGURATION TABLES
-- =============================================================================

-- BPS API Configuration and API Keys
CREATE TABLE IF NOT EXISTS bps_config (
    id SERIAL PRIMARY KEY,
    config_name VARCHAR(100) NOT NULL UNIQUE,
    api_key VARCHAR(255) NOT NULL,
    base_url VARCHAR(255) DEFAULT 'https://webapi.bps.go.id/v1/api/view',
    is_active BOOLEAN DEFAULT true,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BPS Statistical Variables Configuration
CREATE TABLE IF NOT EXISTS bps_variables (
    id SERIAL PRIMARY KEY,
    variable_id VARCHAR(50) NOT NULL UNIQUE, -- BPS varID
    variable_name VARCHAR(255) NOT NULL,
    variable_name_en VARCHAR(255),
    unit VARCHAR(100),
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BPS Monitored Areas (Links to existing provinces/kabupaten tables)
CREATE TABLE IF NOT EXISTS bps_monitored_areas (
    id SERIAL PRIMARY KEY,
    -- Reference to existing area tables
    area_type VARCHAR(20) NOT NULL CHECK (area_type IN ('province', 'kabupaten')),
    area_id UUID NOT NULL, -- References provinces.id or kabupaten.id
    area_code VARCHAR(4) NOT NULL, -- BPS area code (2-digit province, 4-digit district)
    is_active BOOLEAN DEFAULT true,
    priority_level INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
-- =======
    CONSTRAINT uk_bps_monitored_areas UNIQUE (area_type, area_id)
);

-- =============================================================================
-- CORE DATA TABLES
-- =============================================================================

-- Main BPS Statistical Data Table (Time-series optimized)
-- Now references existing area tables via UUIDs
CREATE TABLE IF NOT EXISTS bps_statistical_data (
    id SERIAL PRIMARY KEY,
    
    -- Area Information (using existing tables)
    area_type VARCHAR(20) NOT NULL CHECK (area_type IN ('province', 'kabupaten')),
    area_id UUID NOT NULL, -- References provinces.id or kabupaten.id
    area_code VARCHAR(4) NOT NULL, -- BPS area code for API calls
    area_name VARCHAR(255) NOT NULL, -- Denormalized for performance
    
    -- Variable Information
    variable_id VARCHAR(50) NOT NULL,
    variable_name VARCHAR(255) NOT NULL,
    unit VARCHAR(100),
    
    -- Time Information
    year INTEGER NOT NULL,
    period_type VARCHAR(20) DEFAULT 'annual', -- annual, quarterly, monthly
    period_value VARCHAR(20), -- For quarterly: Q1, Q2, Q3, Q4; For monthly: 01, 02, etc.
    
    -- Data Value
    data_value DECIMAL(15,4),
    data_value_formatted VARCHAR(100), -- For display purposes
    data_status VARCHAR(20) DEFAULT 'final', -- preliminary, final, revised
    
    -- Metadata
    source_api VARCHAR(100) DEFAULT 'bps_web_api_v1',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_hash VARCHAR(64), -- For change detection
    
    -- Foreign key constraints
-- =======
    
    -- Constraints
    CONSTRAINT uk_bps_data UNIQUE (area_type, area_id, variable_id, year, COALESCE(period_value, 'annual'))
);

-- =============================================================================
-- SYNCHRONIZATION TABLES
-- =============================================================================

-- BPS Data Synchronization History
CREATE TABLE IF NOT EXISTS bps_sync_history (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual', 'scheduled')),
    sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('running', 'completed', 'failed', 'cancelled')),
    
    -- Scope of sync
    target_areas TEXT[], -- Array of area codes
    target_variables TEXT[], -- Array of variable IDs
    target_years INTEGER[], -- Array of years
    
    -- Statistics
    total_records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    
    -- Metadata
    triggered_by VARCHAR(100), -- user_id or 'system'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BPS API Request Log (for monitoring and debugging)
CREATE TABLE IF NOT EXISTS bps_api_requests (
    id SERIAL PRIMARY KEY,
    request_url TEXT NOT NULL,
    request_method VARCHAR(10) DEFAULT 'GET',
    request_params JSONB,
    
    -- Response information
    response_status INTEGER,
    response_time_ms INTEGER,
    response_size_bytes INTEGER,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Rate limiting
    rate_limit_remaining INTEGER,
    rate_limit_reset_time TIMESTAMP,
    
    -- Metadata
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_history_id INTEGER REFERENCES bps_sync_history(id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Time-series query optimization (updated for UUID-based areas)
CREATE INDEX IF NOT EXISTS idx_bps_data_time_series ON bps_statistical_data (area_type, area_id, variable_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_bps_data_area_time ON bps_statistical_data (area_type, area_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_bps_data_variable_time ON bps_statistical_data (variable_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_bps_data_area_code ON bps_statistical_data (area_code);

-- Monitored areas indexes
CREATE INDEX IF NOT EXISTS idx_bps_monitored_areas_type_active ON bps_monitored_areas (area_type, is_active);
CREATE INDEX IF NOT EXISTS idx_bps_monitored_areas_area_id ON bps_monitored_areas (area_id);
CREATE INDEX IF NOT EXISTS idx_bps_monitored_areas_code ON bps_monitored_areas (area_code);

-- Variable lookups
CREATE INDEX IF NOT EXISTS idx_bps_variables_active ON bps_variables (is_active);
CREATE INDEX IF NOT EXISTS idx_bps_variables_category ON bps_variables (category);

-- Sync history queries
CREATE INDEX IF NOT EXISTS idx_bps_sync_history_status ON bps_sync_history (sync_status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_bps_sync_history_type ON bps_sync_history (sync_type, started_at DESC);

-- API request monitoring
CREATE INDEX IF NOT EXISTS idx_bps_api_requests_status ON bps_api_requests (response_status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_bps_api_requests_sync ON bps_api_requests (sync_history_id);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bps_config_updated_at BEFORE UPDATE ON bps_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for new tables
CREATE TRIGGER update_bps_monitored_areas_updated_at BEFORE UPDATE ON bps_monitored_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bps_variables_updated_at BEFORE UPDATE ON bps_variables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bps_statistical_data_updated_at BEFORE UPDATE ON bps_statistical_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data change detection (updated for UUID-based areas)
CREATE OR REPLACE FUNCTION update_data_hash()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate hash for change detection
    NEW.data_hash = encode(digest(
        COALESCE(NEW.area_id::text, '') || '|' ||
        COALESCE(NEW.area_type, '') || '|' ||
        COALESCE(NEW.variable_id, '') || '|' ||
        COALESCE(NEW.year::text, '') || '|' ||
        COALESCE(NEW.data_value::text, '') || '|' ||
        COALESCE(NEW.data_value_formatted, '') || '|' ||
        COALESCE(NEW.data_status, ''),
        'sha256'
    ), 'hex');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =======
CREATE TRIGGER update_bps_data_hash BEFORE INSERT OR UPDATE ON bps_statistical_data
    FOR EACH ROW EXECUTE FUNCTION update_data_hash();

-- =============================================================================
-- VALIDATION TRIGGERS FOR POLYMORPHIC FOREIGN KEYS
-- =============================================================================

-- Validation function for bps_monitored_areas
CREATE OR REPLACE FUNCTION validate_bps_monitored_areas_area_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate that area_id exists in the appropriate table based on area_type
    IF NEW.area_type = 'province' THEN
        IF NOT EXISTS (SELECT 1 FROM public.provinces WHERE id = NEW.area_id) THEN
            RAISE EXCEPTION 'area_id % does not exist in provinces table for area_type province', NEW.area_id;
        END IF;
    ELSIF NEW.area_type = 'kabupaten' THEN
        IF NOT EXISTS (SELECT 1 FROM public.kabupaten WHERE id = NEW.area_id) THEN
            RAISE EXCEPTION 'area_id % does not exist in kabupaten table for area_type kabupaten', NEW.area_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Validation function for bps_statistical_data
CREATE OR REPLACE FUNCTION validate_bps_statistical_data_area_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate that area_id exists in the appropriate table based on area_type
    IF NEW.area_type = 'province' THEN
        IF NOT EXISTS (SELECT 1 FROM public.provinces WHERE id = NEW.area_id) THEN
            RAISE EXCEPTION 'area_id % does not exist in provinces table for area_type province', NEW.area_id;
        END IF;
    ELSIF NEW.area_type = 'kabupaten' THEN
        IF NOT EXISTS (SELECT 1 FROM public.kabupaten WHERE id = NEW.area_id) THEN
            RAISE EXCEPTION 'area_id % does not exist in kabupaten table for area_type kabupaten', NEW.area_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation triggers
CREATE TRIGGER validate_bps_monitored_areas_insert BEFORE INSERT ON bps_monitored_areas
    FOR EACH ROW EXECUTE FUNCTION validate_bps_monitored_areas_area_id();

CREATE TRIGGER validate_bps_monitored_areas_update BEFORE UPDATE ON bps_monitored_areas
    FOR EACH ROW EXECUTE FUNCTION validate_bps_monitored_areas_area_id();

CREATE TRIGGER validate_bps_statistical_data_insert BEFORE INSERT ON bps_statistical_data
    FOR EACH ROW EXECUTE FUNCTION validate_bps_statistical_data_area_id();

CREATE TRIGGER validate_bps_statistical_data_update BEFORE UPDATE ON bps_statistical_data
    FOR EACH ROW EXECUTE FUNCTION validate_bps_statistical_data_area_id();

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Latest data view for each area-variable combination
CREATE OR REPLACE VIEW bps_latest_data AS
SELECT DISTINCT ON (area_type, area_id, variable_id)
    area_type,
    area_id,
    area_code,
    area_name,
    variable_id,
    variable_name,
    unit,
    year,
    period_type,
    period_value,
    data_value,
    data_value_formatted,
    data_status,
    last_updated
FROM bps_statistical_data
ORDER BY area_type, area_id, variable_id, year DESC, last_updated DESC;

-- Province summary view (aggregated kabupaten data to province level)
CREATE OR REPLACE VIEW bps_province_summary AS
SELECT
    p.code as province_code,
    p.name as province_name,
    bsd.variable_id,
    bsd.variable_name,
    bsd.unit,
    bsd.year,
    AVG(bsd.data_value) as avg_data_value,
    SUM(bsd.data_value) as total_data_value,
    COUNT(*) as kabupaten_count,
    MAX(bsd.last_updated) as last_updated
FROM bps_statistical_data bsd
JOIN public.kabupaten k ON bsd.area_id = k.id AND bsd.area_type = 'kabupaten'
JOIN public.provinces p ON k.province_id = p.id
WHERE bsd.area_type = 'kabupaten'
GROUP BY p.code, p.name, bsd.variable_id, bsd.variable_name, bsd.unit, bsd.year;

-- Sync statistics view
CREATE OR REPLACE VIEW bps_sync_statistics AS
SELECT 
    DATE(started_at) as sync_date,
    sync_type,
    COUNT(*) as total_syncs,
    AVG(duration_seconds) as avg_duration_seconds,
    SUM(records_inserted) as total_records_inserted,
    SUM(records_updated) as total_records_updated,
    SUM(records_failed) as total_records_failed
FROM bps_sync_history
WHERE sync_status = 'completed'
GROUP BY DATE(started_at), sync_type
ORDER BY sync_date DESC, sync_type;

-- =============================================================================
-- SAMPLE DATA INSERTS (for testing)
-- =============================================================================

-- Insert default configuration
INSERT INTO bps_config (config_name, api_key, is_active) 
VALUES ('default_bps_config', 'your_bps_api_key_here', true)
ON CONFLICT (config_name) DO NOTHING;

-- Insert sample variables (common economic indicators)
INSERT INTO bps_variables (variable_id, variable_name, unit, category, description) VALUES
('7101', 'Produksi Padi', 'Ton', 'Agriculture', 'Rice production in tons'),
('7102', 'Produksi Jagung', 'Ton', 'Agriculture', 'Corn production in tons'),
('6201', 'Jumlah Penduduk', 'Jiwa', 'Demographics', 'Total population'),
('6301', 'PDRB Harga Berlaku', 'Miliar Rupiah', 'Economy', 'GRDP at current prices'),
('6401', 'Tingkat Pengangguran', 'Persen', 'Employment', 'Unemployment rate')
ON CONFLICT (variable_id) DO NOTHING;

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to sync area codes from existing tables to BPS monitored areas
CREATE OR REPLACE FUNCTION sync_bps_monitored_areas()
RETURNS INTEGER AS $$
DECLARE
    province_record RECORD;
    kabupaten_record RECORD;
    inserted_count INTEGER := 0;
BEGIN
    -- Sync provinces
    FOR province_record IN 
        SELECT id, code, name FROM public.provinces WHERE code IS NOT NULL
    LOOP
        INSERT INTO bps_monitored_areas (area_type, area_id, area_code, priority_level)
        VALUES ('province', province_record.id, province_record.code, 1)
        ON CONFLICT (area_type, area_id) DO NOTHING;
        
        IF FOUND THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    -- Sync kabupaten
    FOR kabupaten_record IN 
        SELECT id, code, name FROM public.kabupaten WHERE code IS NOT NULL
    LOOP
        INSERT INTO bps_monitored_areas (area_type, area_id, area_code, priority_level)
        VALUES ('kabupaten', kabupaten_record.id, kabupaten_record.code, 1)
        ON CONFLICT (area_type, area_id) DO NOTHING;
        
        IF FOUND THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get area information by BPS area code
CREATE OR REPLACE FUNCTION get_area_by_bps_code(bps_code VARCHAR)
RETURNS TABLE(
    area_type VARCHAR,
    area_id UUID,
    area_code VARCHAR,
    area_name VARCHAR,
    parent_name VARCHAR
) AS $$
BEGIN
    -- Try provinces first
    RETURN QUERY
    SELECT 
        'province'::VARCHAR as area_type,
        p.id as area_id,
        p.code as area_code,
        p.name as area_name,
        NULL::VARCHAR as parent_name
    FROM public.provinces p
    WHERE p.code = bps_code;
    
    -- If not found, try kabupaten
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            'kabupaten'::VARCHAR as area_type,
            k.id as area_id,
            k.code as area_code,
            k.name as area_name,
            p.name as parent_name
        FROM public.kabupaten k
        JOIN public.provinces p ON k.province_id = p.id
        WHERE k.code = bps_code;
    END IF;
END;
$$ LANGUAGE plpgsql;