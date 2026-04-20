import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env BEFORE schema validation runs. This module is imported first by
// server/index.js specifically so downstream modules (auth.js, db.js) see a
// fully-populated process.env.
dotenv.config();

// =============================================================================
// Panel — Environment Validation
// Fails fast on startup if critical security env vars are missing/weak.
// Ported pattern from e-telekomunikasi-js (src/lib/env.ts).
// =============================================================================

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server
  PORT: z.string().regex(/^\d+$/).default('4000'),
  PUBLIC_BASE_URL: z.string().url().optional(),

  // Auth — REQUIRED ≥32 chars
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ACCESS_EXPIRES_IN: z.string().default('1h'),
  REFRESH_EXPIRES_DAYS: z.string().regex(/^\d+$/).default('30'),

  // Encryption (PII fields)
  ENCRYPTION_KEY: z
    .string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters')
    .optional(),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').optional(),
  PGHOST: z.string().optional(),
  PGPORT: z.string().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGDATABASE: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // External services
  ETELKOM_API_URL: z.string().url().optional(),
  ETELKOM_API_KEY: z.string().optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('FATAL: Invalid environment variables');
    for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
      console.error(`  ${field}: ${messages.join(', ')}`);
    }
    process.exit(1);
  }

  // Extra production checks
  if (parsed.data.NODE_ENV === 'production') {
    if (parsed.data.JWT_SECRET === 'dev-secret-change-me') {
      console.error('FATAL: JWT_SECRET must not use the development default in production');
      process.exit(1);
    }
    if (!parsed.data.ENCRYPTION_KEY) {
      console.error('FATAL: ENCRYPTION_KEY is required in production');
      process.exit(1);
    }
    if (!parsed.data.DATABASE_URL && !parsed.data.PGHOST) {
      console.error('FATAL: DATABASE_URL or PGHOST is required in production');
      process.exit(1);
    }
  }

  return parsed.data;
}

export const env = validateEnv();
