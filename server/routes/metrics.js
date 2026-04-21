// =============================================================================
// Panel — Internal metrics endpoint for etelkom CMS "Pencapaian" auto-refresh.
// Server-to-server only; gated by X-Service-Key header (no user session).
//
// Required ENV:
//   PANEL_SERVICE_API_KEY — shared secret between etelkom (caller) and panel.
//                           Must match the caller's ETELEKOM_SERVICE_KEY /
//                           PANEL_SERVICE_API_KEY. If unset, endpoint returns 401.
// =============================================================================

import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// ── Inline service-key gate ─────────────────────────────────────────────────
// Kept inline (small enough) per convention. Timing-safe-ish compare via
// length + char-by-char is unnecessary here because the key space is large
// and this endpoint is non-auth-bearing.
function requireServiceKey(req, res, next) {
  const provided = req.headers['x-service-key'];
  const expected = process.env.PANEL_SERVICE_API_KEY;

  if (!expected || !provided || provided !== expected) {
    return res.status(401).json({ success: false, message: 'Service key invalid' });
  }
  return next();
}

// ── GET /v2/panel/api/internal/metrics ──────────────────────────────────────
// Returns aggregate SKLO metrics for the etelkom landing "Pencapaian" panel.
router.get('/internal/metrics', requireServiceKey, async (_req, res) => {
  try {
    // Assumptions (see sklo.js):
    //   • Table: public.ulo_applications (column `sklo_number`, `status`, `issued_at`, `created_at`)
    //   • "Completed / issued" terminal statuses in existing UI map: 'completed' and 'approved'
    //     both render as "Disetujui" (see routes/sklo.js formatStatus()).
    //   • `created_at` assumed to exist on ulo_applications (standard audit column).
    const [totalRes, yearRes, completedRes] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS count
           FROM public.ulo_applications
          WHERE sklo_number IS NOT NULL`
      ),
      query(
        `SELECT COUNT(*)::int AS count
           FROM public.ulo_applications
          WHERE sklo_number IS NOT NULL
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())`
      ),
      query(
        `SELECT COUNT(*)::int AS count
           FROM public.ulo_applications
          WHERE sklo_number IS NOT NULL
            AND status IN ('completed', 'approved')`
      ),
    ]);

    const totalSklo = totalRes.rows[0]?.count ?? 0;
    const totalSkloYear = yearRes.rows[0]?.count ?? 0;
    const totalSkloCompleted = completedRes.rows[0]?.count ?? 0;

    // TODO: define SLA computation once KOMDIGI provides target days.
    // Intended formula: (issued within SLA / total issued) * 100.
    const slaAchievement = null;

    return res.json({
      success: true,
      data: {
        year: new Date().getFullYear(),
        totalSklo,
        totalSkloYear,
        totalSkloCompleted,
        slaAchievement,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[metrics] Failed to compute SKLO metrics', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data metrik',
    });
  }
});

export default router;
