-- =============================================================================
-- Migration 001: Add external authentication columns for cross-login
-- Enables e-telekomunikasi users to link their accounts with Panel accounts.
-- =============================================================================

-- Add external ID columns to auth.users
ALTER TABLE auth.users
    ADD COLUMN IF NOT EXISTS external_id UUID,
    ADD COLUMN IF NOT EXISTS external_source VARCHAR(50);

-- Unique constraint: one external account per source
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_external_link
    ON auth.users (external_id, external_source)
    WHERE external_id IS NOT NULL;

-- Index for looking up linked accounts
CREATE INDEX IF NOT EXISTS idx_auth_users_external_source
    ON auth.users (external_source)
    WHERE external_source IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN auth.users.external_id IS 'User ID from external system (e.g., e-telekomunikasi user UUID)';
COMMENT ON COLUMN auth.users.external_source IS 'External system identifier (e.g., ''etelekomunikasi'')';
