import rateLimit from 'express-rate-limit';

// =============================================================================
// Panel — Rate Limit Presets
// Mirrors RATE_LIMITS presets in e-telekomunikasi-js (src/lib/rate-limit.ts).
// Use Nginx/CDN rate limits as an additional outer layer in production.
// =============================================================================

const common = {
  standardHeaders: true,
  legacyHeaders: false,
};

/** General API — 60 req/min per IP */
export const apiLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
});

/** Login — 5 attempts / 15 min per IP (brute force mitigation) */
export const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' },
});

/** Registration — 10 attempts / 15 min per IP */
export const registerLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak registrasi. Silakan coba lagi nanti.' },
});

/** Password reset — 3 attempts / 30 min per IP */
export const passwordResetLimiter = rateLimit({
  ...common,
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: { error: 'Terlalu banyak permintaan reset password.' },
});

/** File upload — 10 uploads / min per IP */
export const uploadLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak unggahan. Silakan coba lagi nanti.' },
});

/** Strict — 10 req / min per IP (sensitive endpoints) */
export const strictLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak permintaan.' },
});

/** Email availability check — 30 checks / min per IP */
export const emailCheckLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Terlalu banyak pengecekan email. Silakan perlambat.' },
});

/** Refresh — 30 / 15 min per IP (tight enough to detect token abuse) */
export const refreshLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Refresh token rate exceeded.' },
});

/** Global soft cap — 10k / 15min per IP (abuse ceiling only) */
export const globalLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 10_000,
});
