-- Add correction status and field-specific corrections to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS correction_notes JSONB DEFAULT '{}';

-- Create enum for correction status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE correction_status AS ENUM ('pending_correction', 'corrected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add correction status column
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS correction_status correction_status DEFAULT NULL;

-- Update company_status enum to include correction
ALTER TYPE company_status ADD VALUE IF NOT EXISTS 'needs_correction';