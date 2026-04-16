-- =============================================================================
-- Migration 003: Telecom Potential Scoring Tables
-- Caches BPS indicators and computes ISP potential scores per region.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.telecom_potential_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id VARCHAR(10) NOT NULL,          -- BPS domain code (e.g., '3100' for DKI Jakarta)
    domain_name VARCHAR(255) NOT NULL,
    domain_type VARCHAR(20) DEFAULT 'prov',  -- 'prov' or 'kab'
    indicator_code VARCHAR(50) NOT NULL,      -- e.g., 'internet_penetration', 'population_density'
    indicator_name VARCHAR(255) NOT NULL,
    value NUMERIC,
    unit VARCHAR(50),
    year INT NOT NULL,
    source_var_id VARCHAR(20),               -- BPS var ID reference
    source_table_id VARCHAR(20),             -- BPS table ID reference
    fetched_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(domain_id, indicator_code, year)
);

CREATE INDEX IF NOT EXISTS idx_telecom_potential_domain
    ON public.telecom_potential_indicators (domain_id);

CREATE INDEX IF NOT EXISTS idx_telecom_potential_indicator
    ON public.telecom_potential_indicators (indicator_code, year);

CREATE TABLE IF NOT EXISTS public.telecom_potential_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id VARCHAR(10) NOT NULL,
    domain_name VARCHAR(255) NOT NULL,
    domain_type VARCHAR(20) DEFAULT 'prov',
    year INT NOT NULL,
    -- Individual scores (0-100)
    population_density_score NUMERIC DEFAULT 0,
    internet_gap_score NUMERIC DEFAULT 0,
    electrification_score NUMERIC DEFAULT 0,
    income_score NUMERIC DEFAULT 0,
    ipm_score NUMERIC DEFAULT 0,
    urbanization_score NUMERIC DEFAULT 0,
    education_score NUMERIC DEFAULT 0,
    mobile_penetration_score NUMERIC DEFAULT 0,
    -- Composite
    total_score NUMERIC DEFAULT 0,
    rank INT,
    tier VARCHAR(10),  -- 'A', 'B', 'C', 'D'
    computed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(domain_id, year)
);

CREATE INDEX IF NOT EXISTS idx_telecom_scores_year
    ON public.telecom_potential_scores (year, total_score DESC);

COMMENT ON TABLE public.telecom_potential_indicators IS 'Cached BPS indicators for telecom potential analysis';
COMMENT ON TABLE public.telecom_potential_scores IS 'Computed ISP/telecom potential scores per region';
