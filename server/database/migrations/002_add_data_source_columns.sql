-- =============================================================================
-- Migration 002: Add data source tracking columns for manual data digitization
-- and external system integration.
-- =============================================================================

-- Ensure telekom_data has a primary key (may be missing on older schemas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'telekom_data' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.telekom_data ADD PRIMARY KEY (id);
    END IF;
END
$$;

-- Extend telekom_data with source tracking
ALTER TABLE public.telekom_data
    ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS source_system VARCHAR(100),
    ADD COLUMN IF NOT EXISTS source_reference TEXT,
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified',
    ADD COLUMN IF NOT EXISTS verified_by UUID,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS digitized_by UUID,
    ADD COLUMN IF NOT EXISTS digitized_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS original_document_url TEXT;

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_telekom_data_source
    ON public.telekom_data (data_source);

CREATE INDEX IF NOT EXISTS idx_telekom_data_verification
    ON public.telekom_data (verification_status)
    WHERE verification_status != 'verified';

-- Manual document metadata table
CREATE TABLE IF NOT EXISTS public.manual_document_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telekom_data_id UUID REFERENCES public.telekom_data(id) ON DELETE SET NULL,
    document_type VARCHAR(100),
    document_number VARCHAR(255),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    original_format VARCHAR(50),
    scan_url TEXT,
    ocr_extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_doc_telekom_data
    ON public.manual_document_metadata (telekom_data_id);

-- Sync configuration table for external integrations
CREATE TABLE IF NOT EXISTS public.sync_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_name VARCHAR(100) UNIQUE NOT NULL,
    adapter_class VARCHAR(100) NOT NULL,
    api_base_url TEXT,
    auth_type VARCHAR(50),
    auth_config JSONB,
    sync_interval_minutes INT DEFAULT 60,
    is_active BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMPTZ,
    last_sync_status VARCHAR(20),
    last_sync_record_count INT,
    last_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default sync configurations (inactive until API keys provided)
INSERT INTO public.sync_configurations (system_name, adapter_class, api_base_url, auth_type, is_active)
VALUES
    ('etelekomunikasi', 'EtelekomunikasiAdapter', NULL, 'api_key', true),
    ('bps', 'BpsAdapter', 'https://webapi.bps.go.id/v1', 'api_key', false),
    ('kominfo_tarif', 'KominfoTarifAdapter', NULL, 'api_key', false),
    ('oss', 'OssAdapter', NULL, 'oauth2', false),
    ('postel', 'PostelAdapter', NULL, 'api_key', false),
    ('sdppi', 'SdppiAdapter', NULL, 'api_key', false)
ON CONFLICT (system_name) DO NOTHING;

COMMENT ON TABLE public.sync_configurations IS 'External system sync configuration for Panel data integration';
COMMENT ON TABLE public.manual_document_metadata IS 'Metadata for digitized manual/paper documents';

-- Enable pg_trgm for fuzzy matching in manual data import
CREATE EXTENSION IF NOT EXISTS pg_trgm;
