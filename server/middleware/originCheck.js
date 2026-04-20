// =============================================================================
// Panel — Origin / CSRF protection for state-changing requests
// Complements SameSite=Lax cookies + bearer auth.
// Matches pattern in e-telekomunikasi-js (src/lib/api-security.ts).
// =============================================================================

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    return new Set([
      'http://localhost:5173',
      'http://localhost:8080',
      'https://dev-etelekomunikasi.komdigi.go.id',
    ]);
  }
  return new Set(raw.split(',').map((o) => o.trim()).filter(Boolean));
}

export function originCheck(req, res, next) {
  if (!MUTATING_METHODS.has(req.method)) return next();

  const origin = req.headers.origin;
  const host = req.headers.host;

  // Allow server-to-server calls (no Origin header, e.g. cron, webhooks with auth key)
  if (!origin) return next();

  try {
    const originHost = new URL(origin).host;
    // Same-origin always allowed
    if (originHost === host) return next();

    // Cross-origin: must be on explicit allowlist
    const allowed = getAllowedOrigins();
    if (allowed.has(origin)) return next();

    return res.status(403).json({ error: 'Forbidden: origin not allowed' });
  } catch {
    return res.status(400).json({ error: 'Invalid origin header' });
  }
}
