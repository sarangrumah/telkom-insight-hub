// =============================================================================
// Panel — Standardized Error Responses
// Pattern from: e-telekomunikasi/src/lib/api-security.ts (apiError function)
// =============================================================================

/**
 * Send a safe JSON error response. In production, 5xx errors never leak internals.
 * @param {import('express').Response} res
 * @param {string} message - Error message (visible in dev, hidden in prod for 5xx)
 * @param {number} [status=500]
 */
export function apiError(res, message, status = 500) {
  if (status >= 500 && process.env.NODE_ENV === 'production') {
    return res.status(status).json({
      error: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    });
  }
  return res.status(status).json({ error: message });
}
