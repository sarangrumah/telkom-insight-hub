import express from 'express';
import crypto from 'node:crypto';
import { query } from '../db.js';
import { apiLimiter, strictLimiter } from '../middleware/rateLimits.js';

// =============================================================================
// Panel — Kabupaten CAPTCHA (ported from e-telekomunikasi-js)
// GET  /v2/panel/api/auth/captcha        → { token, challenge }
// POST /v2/panel/api/auth/captcha/verify → { valid }
// Tokens live in memory with TTL; verified tokens extend to 10 min so a
// multi-step registration form (uploads) has time to submit.
// =============================================================================

const CAPTCHA_TTL = 5 * 60_000;          // 5 min for unverified challenges
const CAPTCHA_VERIFIED_TTL = 10 * 60_000; // 10 min after verification

/** @type {Map<string, { answer: string; expiresAt: number }>} */
const captchaStore = new Map();

let cleanupTimer = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of captchaStore) {
      if (now > entry.expiresAt) captchaStore.delete(key);
    }
    if (captchaStore.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, 60_000);
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Server-side check used by registration handlers.
 * Returns true only if the client previously POSTed a correct answer for this token.
 * Does NOT delete the token — call consumeCaptchaToken() after the transaction succeeds.
 */
export function verifyCaptchaToken(token) {
  if (!token || typeof token !== 'string') return false;
  const entry = captchaStore.get(token);
  if (!entry || Date.now() > entry.expiresAt) {
    captchaStore.delete(token);
    return false;
  }
  return entry.answer.startsWith('verified:');
}

export function consumeCaptchaToken(token) {
  if (typeof token === 'string') captchaStore.delete(token);
}

const router = express.Router();

// ── GET challenge ───────────────────────────────────────────────────────────
router.get('/auth/captcha', apiLimiter, async (_req, res) => {
  try {
    // Pick a random kabupaten name via OFFSET random()
    const { rows: countRows } = await query('SELECT COUNT(*)::int AS n FROM public.kabupaten');
    const total = countRows[0]?.n ?? 0;
    if (total === 0) {
      return res.status(503).json({ success: false, message: 'Data wilayah belum tersedia.' });
    }

    const skip = Math.floor(Math.random() * total);
    const { rows } = await query(
      'SELECT name FROM public.kabupaten ORDER BY id LIMIT 1 OFFSET $1',
      [skip],
    );
    const record = rows[0];
    if (!record?.name) {
      return res.status(500).json({ success: false, message: 'Gagal memuat tantangan CAPTCHA.' });
    }

    ensureCleanup();
    const token = crypto.randomBytes(32).toString('hex');
    const challenge = String(record.name).toUpperCase();
    captchaStore.set(token, {
      answer: challenge.toLowerCase(),
      expiresAt: Date.now() + CAPTCHA_TTL,
    });

    return res.json({ success: true, data: { token, challenge } });
  } catch (e) {
    console.error('[GET /auth/captcha]', e?.message);
    return res.status(500).json({ success: false, message: 'Gagal memuat tantangan CAPTCHA.' });
  }
});

// ── POST verify ─────────────────────────────────────────────────────────────
router.post('/auth/captcha/verify', strictLimiter, (req, res) => {
  try {
    const { token, answer } = req.body || {};
    if (!token || !answer) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Token dan jawaban wajib diisi.',
      });
    }

    const entry = captchaStore.get(token);
    if (!entry || Date.now() > entry.expiresAt) {
      captchaStore.delete(token);
      return res.json({
        success: true,
        valid: false,
        expired: true,
        message: 'CAPTCHA kedaluwarsa. Silakan muat ulang.',
      });
    }

    // If already marked verified, do not re-accept a different answer.
    if (entry.answer.startsWith('verified:')) {
      return res.json({ success: true, valid: true, message: 'Verifikasi berhasil.' });
    }

    const normalized = String(answer).trim().toLowerCase();
    const valid = normalized === entry.answer;

    if (valid) {
      captchaStore.set(token, {
        answer: `verified:${entry.answer}`,
        expiresAt: Date.now() + CAPTCHA_VERIFIED_TTL,
      });
    }

    return res.json({
      success: true,
      valid,
      message: valid ? 'Verifikasi berhasil.' : 'Jawaban tidak sesuai. Silakan coba lagi.',
    });
  } catch (e) {
    console.error('[POST /auth/captcha/verify]', e?.message);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Gagal memverifikasi CAPTCHA.',
    });
  }
});

export default router;
