-- Fixed BPS Statistical Data Table
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
    
    -- Constraints
    CONSTRAINT uk_bps_data UNIQUE (area_type, area_id, variable_id, year, period_value)
);