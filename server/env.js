// =============================================================================
// Panel — Environment Validation (Zod)
// Validates all required env vars at startup. Fails fast on misconfiguration.
// Pattern from: e-telekomunikasi/src/lib/env.ts
// =============================================================================

import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env BEFORE validation
dotenv.config();

const envSchema = z.object({
  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // ── Authentication (JWT) ──────────────────────────────────────────────────
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ACCESS_EXPIRES_IN: z.string().default('1h'),
  REFRESH_EXPIRES_DAYS: z.coerce.number().default(30),

  // ── Server ────────────────────────────────────────────────────────────────
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default(''),

  // ── eTelekomunikasi Integration (optional for local dev without cross-login)
  ETELEKOM_API_URL: z.string().default('http://localhost:3000'),
  ETELEKOM_SERVICE_KEY: z.string().default(''),

  // ── External APIs (optional) ──────────────────────────────────────────────
  KOMINFO_TARIF_API_BASE_URL: z.string().optional(),
  KOMINFO_TARIF_API_KEY: z.string().optional(),
  BPS_API_KEY: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    '╔══════════════════════════════════════════════════════════╗'
  );
  console.error(
    '║  FATAL: Invalid environment variables                   ║'
  );
  console.error(
    '╚══════════════════════════════════════════════════════════╝'
  );

  const errors = result.error.flatten().fieldErrors;
  for (const [field, messages] of Object.entries(errors)) {
    console.error(`  ${field}: ${messages.join(', ')}`);
  }

  process.exit(1);
}

export const env = result.data;
